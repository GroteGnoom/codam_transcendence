import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.enableCors({
	  origin: true,
    "credentials": true,
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
  await app.listen(5000);
}
bootstrap();
