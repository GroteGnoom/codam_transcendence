import { PassportStrategy } from '@nestjs/passport';
import {
//	HttpService,
	Injectable,
} from '@nestjs/common';
//import { AuthService } from './auth.service';
import { Strategy } from 'passport-oauth2';
import { stringify } from 'querystring';

// change these to be your ft client ID and secret
const clientID = 'insert-client-id';
const clientSecret = 'insert-client-secret';
const callbackURL = 'http://localhost:8080/auth/ft';

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy, 'ft')
{
	constructor(
		//private authService: AuthService,
		//private http: HttpService,
	) {
		super({
			/*
			authorizationURL: `https://api.intra.42.fr/authorize?${ stringify({
				client_id    : clientID,
				redirect_uri : callbackURL,
				response_type: 'code',
				scope        : 'identify',
			}) }`,
		   */
			authorizationURL: 'https://api.intra.42.fr',
			tokenURL        : 'https://api.intra.42.fr/oauth/token',
			scope           : 'public',
			clientID,
			clientSecret,
			callbackURL,
		});
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
