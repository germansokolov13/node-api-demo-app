import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ImageConsumerModule } from './modules/image-consumer/image-consumer.module';
import { config } from './env-config';
import { AppLogger } from './utils/logger';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    ImageConsumerModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [config.rabbitMq.url],
        queue: config.rabbitMq.queue,
      },
    },
  );
  app.useLogger(new AppLogger());
  await app.listen();
}

bootstrap();
