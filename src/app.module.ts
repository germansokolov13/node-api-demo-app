import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostingsModule } from './modules/postings/postings.module';
import { S3Module } from 'nestjs-s3';
import { ImageUploadsModule } from './modules/imageUploads/imageUploads.module';
import { AuthModule } from './modules/auth/auth.module';

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
    ImageUploadsModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
