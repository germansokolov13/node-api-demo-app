import { Module } from '@nestjs/common';
import { ImageUploadsService } from './imageUploads.service';
import { ImageUploadsController } from './imageUploads.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'rabbit-image-uploads-module',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'image-uploads',
        },
      },
    ]),
  ],
  controllers: [ImageUploadsController],
  providers: [ImageUploadsService],
})
export class ImageUploadsModule {}
