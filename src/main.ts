import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from './env-config';
import * as session from 'express-session';
import { WsAdapter } from '@nestjs/platform-ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: config.frontendOrigin,
  });
  app.useWebSocketAdapter(new WsAdapter(app));
  await app.listen(3001);
}
bootstrap();
