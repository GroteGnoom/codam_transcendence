import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { useContainer } from 'class-validator'
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as cors from 'cors'
import { get_frontend_host } from './utils';
const os = require("os");

async function bootstrap() {
	const configApp = await NestFactory.create(AppModule);
	let configService = configApp.get(ConfigService);
  const app = await NestFactory.create(AppModule, {logger: ['log']});
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
			  console.log('origin not found, allowing cors');
			  callback(null, true);
			  return;
		  }
		  const url = new URL(origin);
		  //const host = url.host;
		  /*
		  console.log('hostname: ', url.hostname);
		  console.log('host: ', url.host);
		  console.log('os hostname: ', os.hostname());
		 */
          var originIsAllowed = allowed.indexOf(origin) !== -1;
		  const match = url.hostname.match('f[01]r[0-9]s[0-9]+.codam.nl');
		  if (match) {
			//   console.log('matched cluster computer');
			  originIsAllowed = true;
		  }
          //console.log('ORIGIN: ', origin);
		  if (originIsAllowed) {
			//   console.log('cors is allowed');
			  callback(null, true);
		  } else {
			  console.log('cors not allowed');
			  callback('Bad Request');
		  }
      },
      credentials:true
    }
	app.use(cors(corsOptions));
	
	await app.listen(5000);
}
bootstrap();
