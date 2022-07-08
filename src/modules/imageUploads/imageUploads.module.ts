import { Module } from '@nestjs/common';
import { ImageUploadsService } from './imageUploads.service';
import { ImageUploadsController } from './imageUploads.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ImageUploadsWsGateway } from './imageUploadsWs.gateway';
import { JwtStrategy } from '../auth/jwtStrategy';
import { JwtModule } from '@nestjs/jwt';

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
    JwtModule.register({
      secret: 'sdf sdf sfsd fsdf sdfsddddd',
      signOptions: { expiresIn: '20 minutes' },
    }),
  ],
  controllers: [ImageUploadsController],
  providers: [ImageUploadsService, ImageUploadsWsGateway, JwtStrategy],
})
export class ImageUploadsModule {}
