import { Module } from '@nestjs/common';
import { ImageConsumerController } from './imageConsumer.controller';
import { S3Module } from 'nestjs-s3';

@Module({
  imports: [
    S3Module.forRoot({
      config: {
        accessKeyId: 'root',
        secretAccessKey: '12345678',
        endpoint: 'http://127.0.0.1:9000',
        s3ForcePathStyle: true,
        signatureVersion: 'v4',
      },
    }),
  ],
  controllers: [ImageConsumerController],
  providers: [],
})
export class ImageConsumerModule {}
