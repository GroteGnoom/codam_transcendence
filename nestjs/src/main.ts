import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { useContainer } from 'class-validator'
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as cors from 'cors'

async function bootstrap() {
	const configApp = await NestFactory.create(AppModule);
	let configService = configApp.get(ConfigService);
  const app = await NestFactory.create(AppModule, {logger: ['log']});
  app.use(cookieParser());
  // useContainer(app.select(AppModule), { fallbackOnErrors: true }); // for custom validation
  app.use(
	  session({
		  cookie: {
			  maxAge: 3600 * 24 * 1000,
		  },
		  name: 'transcendence',
		  secret: configService.get('SESSION_SECRET'),
		  resave: false,
		  saveUninitialized: false,
	  }),
  );
    var allowed = ['http://127.0.0.1:3000', 'http://localhost:3000', 'https://127.0.0.1:5000']
    var corsOptions = {
      origin: (origin, callback) => {
		  if (!origin) {
			  console.log('origin: ', origin);  // => undefined
			  callback(null);
			  return;
		  }
          var originIsAllowed = allowed.indexOf(origin) !== -1;
          console.log('ORIGIN: ', origin);  // => undefined
          callback(originIsAllowed ? null : 'Bad Request', originIsAllowed)
      },
      credentials:true
    }
	app.use(cors(corsOptions));
	await app.listen(5000);
}
bootstrap();
