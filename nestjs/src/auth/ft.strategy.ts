import { PassportStrategy } from '@nestjs/passport';
import {
//	HttpService,
	Injectable,
	Logger,
} from '@nestjs/common';
//import { AuthService } from './auth.service';
import { Strategy } from 'passport-oauth2';
import { stringify } from 'querystring';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

// change these to be your ft client ID and secret
const callbackURL = 'http://www.example.com/index.html';

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy, 'ft')
{
	private readonly logger = new Logger(FtStrategy.name);
	constructor(
		//private authService: AuthService,
		private httpService: HttpService,
		private configService: ConfigService,
	) {
		super({
			authorizationURL: `https://api.intra.42.fr/oauth/authorize?${ stringify({
				client_id    : configService.get('FT_OAUTH_CLIENT_ID'),
				redirect_uri : callbackURL,
				response_type: 'code',
				scope        : 'public',
			}) }`,
			tokenURL        : 'https://api.intra.42.fr/oauth/token',
			scope           : 'public',
			clientID: configService.get('FT_OAUTH_CLIENT_ID'),
			clientSecret: configService.get('FT_OAUTH_CLIENT_SECRET'),
			callbackURL,
		});
		this.logger.log('FtStrategy constructed\n');
	}
	validate ( accessToken: string) {
		this.logger.log('validate is called\n');
		const data = this.httpService
			.get('https://api.intra.42.fr/oauth/token/info', {
				headers: { Authorization: `Bearer ${accessToken}` },
			});
		this.logger.log('this is the data:', data);
		return data;

		/*
		const intraID = data.data.id;
		const username = data.data.login;
		const validateUserDto = { intraID, username };
		return await this.authService.validateUser(validateUserDto);
		return "not actually validated";
	   */
	}

	/*
	async validate(
		accessToken: string,
	): Promise<any> {
		const { data } = await this.http.get('https://discordapp.com/api/users/@me', {
				headers: { Authorization: `Bearer ${ accessToken }` },
			})
			.toPromise();

		return this.authService.findUserFromDiscordId(data.id);
	}
   */
}
