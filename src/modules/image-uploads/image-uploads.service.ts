import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectS3, S3 } from 'nestjs-s3';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { config } from '../../env-config';
import { ImageProcessingRequestDto } from './image-processing-request.dto';
import { ImageProcessingResponseDto } from './image-processing-response.dto';

export const RABBITMQ_IMAGES_UPLOADS_MODULE = 'rabbit-image-uploads-module';

@Injectable()
export class ImageUploadsService {
  private readonly logger = new Logger(ImageUploadsService.name);

  constructor(
    @InjectS3() private readonly s3: S3,
    private readonly jwtService: JwtService,
    @Inject(RABBITMQ_IMAGES_UPLOADS_MODULE)
    private readonly rabbitClient: ClientProxy,
  ) {}

  async getImageUploadFields(userId: string): Promise<Record<string, string>> {
    const rnd = randomBytes(32).toString('base64url');
    const objectKey = `${new Date().getTime()}_${userId}_${rnd}`;

    const params = {
      Expires: 3600, // If file is not processed in 1 hour for some reason then it's deleted
      Bucket: config.s3.uploadBucket,
      Fields: {
        key: objectKey,
        acl: 'private',
      },
      Conditions: [
        ['starts-with', '$Content-Type', 'image/'],
        ['content-length-range', 1, config.s3.maxFileSize],
      ],
    };

    const presignedPost: any = await new Promise((resolve, reject) => {
      this.s3.createPresignedPost(params, (err, result) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(result);
      });
    });

    return presignedPost.fields;
  }

  async processImage(request: ImageProcessingRequestDto): Promise<ImageProcessingResponseDto> {
    try {
      const { authToken, s3Key } = request;
      let user;
      try {
        user = this.jwtService.verify(authToken);
      } catch (e) {
        return { isSuccess: false, error: 'Auth failure' };
      }

      this.logger.log('put job', { s3Key });
      const rabbitObservable = this.rabbitClient.send('process-image', { s3Key, user });
      const { isSuccess, error } = await firstValueFrom(rabbitObservable);
      this.logger.log('job finished', { s3Key, isSuccess, error });

      return { isSuccess, error };
    } catch (e) {
      return { isSuccess: false, error: 'An error occurred' };
    }
  }
}
