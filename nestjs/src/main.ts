import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { useContainer } from 'class-validator'
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { ConfigModule, ConfigService } from '@nestjs/config';

async function bootstrap() {
	const configApp = await NestFactory.create(AppModule);
	let configService = configApp.get(ConfigService);
  const app = await NestFactory.create(AppModule, {logger: ['log']});
  app.use(cookieParser());
  // useContainer(app.select(AppModule), { fallbackOnErrors: true }); // for custom validation
  app.use(
	  session({
		  secret: configService.get('SESSION_SECRET'),
		  resave: false,
		  saveUninitialized: false,
	  }),
  );
  // app.enableCors();
  app.enableCors({
	  origin: true,
    "credentials": true,
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
  })
  await app.listen(5000);
}
bootstrap();
