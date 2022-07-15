import { NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { AppModule } from './app.module';
import { config } from './env-config';
import { AppLogger } from './utils/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useLogger(new AppLogger());
  app.enableCors({
    origin: config.frontendOrigin,
  });
  app.useWebSocketAdapter(new WsAdapter(app));

  await app.listen(config.port);
}
bootstrap();
