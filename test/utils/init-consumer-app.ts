import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { AppLogger } from '../../src/utils/logger';
import { WsAdapter } from '@nestjs/platform-ws';
import { INestApplication, INestMicroservice } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { config } from '../../src/env-config';
import { ImageConsumerModule } from '../../src/modules/image-consumer/image-consumer.module';

export async function initConsumerApp(): Promise<INestMicroservice> {
  const moduleRef = await Test.createTestingModule({
    imports: [ImageConsumerModule],
  })
    .compile();

  const app: INestMicroservice = moduleRef.createNestMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [config.rabbitMq.url],
      queue: config.rabbitMq.queue,
    },
  });

  const logger = new AppLogger();
  logger.setLogLevels(['error', 'warn']);
  app.useLogger(logger);

  await app.listen();

  return app;
}
