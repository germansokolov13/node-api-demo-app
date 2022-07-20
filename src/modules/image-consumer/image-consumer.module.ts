import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { S3Module } from 'nestjs-s3';
import { ImageConsumerController } from './image-consumer.controller';
import { Posting, PostingSchema } from '../../schemas/posting.schema';
import { PostingsService } from '../postings/postings.service';
import { config } from '../../env-config';
import { ManticoreSearch } from '../postings/manticore-search.service';

// Separate entry-point module for consumer daemon
@Module({
  imports: [
    MongooseModule.forRoot(config.mongodb.url, {
      dbName: config.mongodb.dbName,
      user: config.mongodb.user,
      pass: config.mongodb.pass,
    }),
    S3Module.forRoot({
      config: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
        endpoint: config.s3.endpoint,
        s3ForcePathStyle: true,
        signatureVersion: 'v4',
      },
    }),
    MongooseModule.forFeature([{ name: Posting.name, schema: PostingSchema }]),
  ],
  controllers: [ImageConsumerController],
  providers: [PostingsService, ManticoreSearch],
})
export class ImageConsumerModule {}
