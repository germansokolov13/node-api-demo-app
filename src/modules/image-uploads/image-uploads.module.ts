import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ImageUploadsService, RABBITMQ_IMAGES_UPLOADS_MODULE } from './image-uploads.service';
import { ImageUploadsController } from './image-uploads.controller';
import { ImageUploadsWsGateway } from './image-uploads-ws.gateway';
import { config } from '../../env-config';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: RABBITMQ_IMAGES_UPLOADS_MODULE,
        transport: Transport.RMQ,
        options: {
          urls: [config.rabbitMq.url],
          queue: config.rabbitMq.queue,
        },
      },
    ]),
    AuthModule,
  ],
  controllers: [ImageUploadsController],
  providers: [ImageUploadsService, ImageUploadsWsGateway],
})
export class ImageUploadsModule {}
