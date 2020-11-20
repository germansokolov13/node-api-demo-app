import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from './env-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: config.frontendOrigin,
  });
  await app.listen(3001);
}
bootstrap();
