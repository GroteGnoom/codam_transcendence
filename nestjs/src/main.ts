import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {logger: ['log']});
  app.use(cookieParser());
  app.enableCors();
  app.enableCors({
	  origin: true,
    "credentials": true,
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
  await app.listen(5000);
}
bootstrap();
