import { Injectable } from '@nestjs/common';
import { InjectS3, S3 } from 'nestjs-s3';
import { EventEmitter } from 'events';

@Injectable()
export class ImageUploadsService {
  private readonly finishEvent: EventEmitter = new EventEmitter();

  constructor(@InjectS3() private readonly s3: S3) {}

  async getImageUploadFields(): Promise<Record<string, string>> {
    const userId = 1; // TODO
    const objectKey =
      new Date().getTime() +
      '_' +
      userId +
      '_' +
      Math.floor(Math.random() * 10000);

    const params = {
      Expires: 3600,
      Bucket: 'image-uploads',
      Fields: {
        key: objectKey,
        acl: 'private',
      },
      Conditions: [
        ['starts-with', '$Content-Type', 'image/'],
        ['content-length-range', 1, 1024 * 1024 * 3],
      ],
    };

    const presignedPost: any = await new Promise((resolve, reject) => {
      this.s3.createPresignedPost(params, (err, presignedPost) => {
        if (err) {
          reject(err);
        }

        resolve(presignedPost);
      });
    });

    return presignedPost.fields;
  }

  public onFinish(userId: string): Promise<void> {
    return new Promise((resolve) => {
      const listener = (e) => {
        if (e.userId === userId) {
          resolve();
          this.finishEvent.removeListener('finish', listener);
        }
      };

      this.finishEvent.addListener('finish', listener);
    });
  }

  public finishProcessing(userId: string): void {
    this.finishEvent.emit('finish', { userId });
  }
}
