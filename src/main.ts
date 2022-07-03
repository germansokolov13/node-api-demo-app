import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from './env-config';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: config.frontendOrigin,
  });
  app.use(
    session({
      secret: 'my-1123123',
      resave: true,
      saveUninitialized: true,
    }),
  );
  await app.listen(3001);
}
bootstrap();
