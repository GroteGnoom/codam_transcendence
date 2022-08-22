import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as session from 'express-session';
import { AppModule } from './app.module';
import { get_frontend_host } from './utils';
const os = require("os");

async function bootstrap() {
	const configApp = await NestFactory.create(AppModule);
	let configService = configApp.get(ConfigService);
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  useContainer(app.select(AppModule), { fallbackOnErrors: true }); // for custom validation
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
    var allowed = ['http://127.0.0.1:3000', 'http://localhost:3000', 'https://127.0.0.1:5000', get_frontend_host()]
    var corsOptions = {
      origin: (origin, callback) => {
		  if (!origin) {
			  callback(null, true);
			  return;
		  }
		  const url = new URL(origin);
          var originIsAllowed = allowed.indexOf(origin) !== -1;
		  const match = url.hostname.match('f[01]r[0-9]s[0-9]+.codam.nl');
		  if (match) {
			  originIsAllowed = true;
		  }
		  if (originIsAllowed) {
			  callback(null, true);
		  } else {
			  callback('Bad Request');
		  }
      },
      credentials:true
    }
	app.use(cors(corsOptions));
	
	await app.listen(5000);
}
bootstrap();
