import { HttpService } from '@nestjs/axios';
import {
	Injectable
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { stringify } from 'querystring';
import { get_backend_host } from 'src/utils';
const util = require('node:util');
const callbackURL = get_backend_host() + '/auth/ft';

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy, 'ft')
{
	constructor(
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
	}

	async validate ( accessToken: string): Promise<string> {
		const resp = await this.httpService .get('https://api.intra.42.fr/v2/me', {
			headers: { Authorization: `Bearer ${accessToken}` },
		}).toPromise();

		return resp.data.login;

	}
}
