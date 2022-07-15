import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { InjectS3, S3 } from 'nestjs-s3';
import { PostingsService } from '../postings/postings.service';
import { config } from '../../env-config';
import { repaintImage } from './repaint-image';
import { ImageProcessingResponseDto } from '../image-uploads/image-processing-response.dto';
import { UserDto } from '../auth/user.dto';

@Controller()
export class ImageConsumerController {
  private readonly logger = new Logger(ImageConsumerController.name);

  constructor(
    @InjectS3() private readonly s3: S3,
    private readonly postingService: PostingsService,
  ) {}

  @MessagePattern('process-image')
  async processImage(
    { s3Key, user }: { s3Key: string, user: UserDto },
  ): Promise<ImageProcessingResponseDto> {
    try {
      this.logger.log('start processing', { s3Key });
      const getParams = {
        Bucket: config.s3.uploadBucket,
        Key: s3Key,
      };
      const image = await this.s3.getObject(getParams).promise();
      const output = await repaintImage(image.Body as Buffer);
      const putParams = {
        Body: output,
        ContentType: image.ContentType,
        Bucket: config.s3.servedBucket,
        Key: s3Key,
      };
      await this.s3.putObject(putParams).promise();
      await this.postingService.createImage(s3Key, user);

      this.logger.log('finish processing', { s3Key });
      return { isSuccess: true };
    } catch (e) {
      this.logger.error(e, { s3Key, e });
      return { isSuccess: false, error: 'Error while processing image' };
    }
  }
}
