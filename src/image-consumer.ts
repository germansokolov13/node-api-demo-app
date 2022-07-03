import { NestFactory } from '@nestjs/core';
import { ImageConsumerModule } from './modules/imageConsumer/imageConsumer.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ImageConsumerModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'image-uploads',
      },
    },
  );
  await app.listen();
}

bootstrap();
