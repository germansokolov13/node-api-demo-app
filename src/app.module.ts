import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostingsModule } from './postings/postings.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost', {
      dbName: 'demo-app',
      db: 'demo-app',
      user: 'root',
      pass: '123456',
    }),
    PostingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
