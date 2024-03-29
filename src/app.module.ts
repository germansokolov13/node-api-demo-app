import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { S3Module } from 'nestjs-s3';
import { PostingsModule } from './modules/postings/postings.module';
import { ImageUploadsModule } from './modules/image-uploads/image-uploads.module';
import { AuthModule } from './modules/auth/auth.module';
import { config } from './env-config';

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
    PostingsModule,
    ImageUploadsModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
