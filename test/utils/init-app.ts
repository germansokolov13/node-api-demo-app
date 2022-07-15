import { Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { AppLogger } from '../../src/utils/logger';
import { WsAdapter } from '@nestjs/platform-ws';
import { INestApplication } from '@nestjs/common';

export async function initApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .compile();

  const app = moduleRef.createNestApplication();
  app.useWebSocketAdapter(new WsAdapter(app));

  const logger = new AppLogger();
  logger.setLogLevels(['error', 'warn']);
  app.useLogger(logger);

  await app.init();

  return app;
}
