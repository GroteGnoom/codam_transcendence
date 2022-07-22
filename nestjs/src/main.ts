import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {logger: ['log']});
  app.use(cookieParser());
  app.use(
	  session({
		  secret: 'my-secret', //TODO actual secret
		  resave: false,
		  saveUninitialized: false,
	  }),
  );
  app.enableCors();
  app.enableCors({
	  origin: true,
    "credentials": true,
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
  await app.listen(5000);
}
bootstrap();
