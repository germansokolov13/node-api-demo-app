import { Module } from '@nestjs/common';
import { ImageConsumerController } from './imageConsumer.controller';
import { S3Module } from 'nestjs-s3';
import { PostingsService } from '../postings/postings.service';
import { PostingsModule } from '../postings/postings.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Posting, PostingSchema } from '../../schemas/posting.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost', {
      dbName: 'demo-app',
      user: 'root',
      pass: '123456',
    }),
    S3Module.forRoot({
      config: {
        accessKeyId: 'root',
        secretAccessKey: '12345678',
        endpoint: 'http://127.0.0.1:9000',
        s3ForcePathStyle: true,
        signatureVersion: 'v4',
      },
    }),
    PostingsModule,
    MongooseModule.forFeature([{ name: Posting.name, schema: PostingSchema }]),
  ],
  controllers: [ImageConsumerController],
  providers: [PostingsService],
})
export class ImageConsumerModule {}
