import { PassportStrategy } from '@nestjs/passport';
import {
	Injectable,
	Logger,
} from '@nestjs/common';
import { Strategy } from 'passport-oauth2';
import { stringify } from 'querystring';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
const util = require('node:util');
import { get_backend_host } from 'src/utils';
const callbackURL = get_backend_host() + '/auth/ft';

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy, 'ft')
{
	private readonly logger = new Logger(FtStrategy.name);
	constructor(
		//private authService: AuthService,
		private httpService: HttpService,
		private configService: ConfigService,
	) {
		var block;
		var client_id;
		var client_secret;

		if (process.env.SERVER_LOCATION === "local") {
			client_id = configService.get('FT_OAUTH_CLIENT_ID');
			client_secret = configService.get('FT_OAUTH_CLIENT_SECRET');
		} else if (process.env.SERVER_LOCATION === "stef") {
			client_id = configService.get('FT_OAUTH_STEF_ID');
			client_secret = configService.get('FT_OAUTH_STEF_SECRET');
		} else if (process.env.SERVER_LOCATION === "iris") {
			client_id = configService.get('FT_OAUTH_IRIS_ID');
			client_secret = configService.get('FT_OAUTH_IRIS_SECRET');
		} else {
			client_id = configService.get('FT_OAUTH_DANIEL_ID');
			client_secret = configService.get('FT_OAUTH_DANIEL_SECRET');
		}
		block = {
				authorizationURL: `https://api.intra.42.fr/oauth/authorize?${ stringify({
					client_id    : client_id,
				redirect_uri : callbackURL,
				response_type: 'code',
				scope        : 'public',
				}) }`,
				tokenURL        : 'https://api.intra.42.fr/oauth/token',
				scope           : 'public',
				clientID: client_id,
				clientSecret: client_secret,
				callbackURL,
		};
		super(block);
		this.logger.log('FtStrategy constructed\n');
		this.logger.log('am i local?', process.env.AMILOCAL);
		this.logger.log('hostname: ', process.env.MYHOSTNAME);
		this.logger.log('callback url: ', callbackURL);
		this.logger.log('clientID: ', client_id);
		this.logger.log('clientSecret: ', client_secret);
	}

	async validate ( accessToken: string): Promise<string> {
		this.logger.log('validate is called\n');
		const resp = await this.httpService .get('https://api.intra.42.fr/v2/me', {
			//this.httpService .get('https://api.intra.42.fr/v2/users', {
			headers: { Authorization: `Bearer ${accessToken}` },
		}).toPromise();

		this.logger.log("validation result:", resp.data.login);

		return resp.data.login;

	}
}
