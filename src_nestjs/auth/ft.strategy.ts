import { PassportStrategy } from '@nestjs/passport';
import { HttpService, Injectable } from '@nestjs/common';
import { Strategy } from 'passport-oauth2';
import { AuthService } from './auth.service';

@Injectable()
export class FtStrategy extends PassportStrategy(Strategy, 'ft')
{
	constructor(
		private authService: AuthService,
		private http: HttpService,
	) {
		super({
			authorizationURL: null,
			tokenURL        : null,
			clientID        : null,
			clientSecret    : null,
			callbackURL     : null,
			scope           : null,
		});
	}

	async validate(
		accessToken: string,
	): Promise<any> {
		const { data } = await this.http.get('https://api.intra.42.fr', {
			headers: { Authorization: `Bearer ${ accessToken }` },
		})
		.toPromise();
		return this.authService.findUserFromFtId(data.id);
	}
}

