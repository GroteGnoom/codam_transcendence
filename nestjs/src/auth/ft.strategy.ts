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
const util = require('node:util');
// change these to be your ft client ID and secret
const callbackURL = 'http://127.0.0.1:5000/auth/ft';

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
		/*
		const data = this.httpService
			.get('https://api.intra.42.fr/v2/cursus/users', {
				headers: { Authorization: `Bearer ${accessToken}` },
			});
		this.logger.log('this is the data:', util.inspect(data, false, null, true));
	   */
	  	this.httpService .get('https://api.intra.42.fr/v2/me', {
	  	//this.httpService .get('https://api.intra.42.fr/v2/users', {
				headers: { Authorization: `Bearer ${accessToken}` },
			}).toPromise().then(response =>{this.logger.log(response.data.login);});//.catch(error => {this.logger.log("niet gelukt", error);});
			//}).toPromise().then(response =>{this.logger.log(response);});//.catch(error => {this.logger.log("niet gelukt", error);});
		//this.logger.log('this is the data:', data.map(res => {return res.json();}));
		return "hallo";

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
		this.logger.log('ft strategy validate called', data);
		const { data } = await this.http.get('https://api.intra.42.fr/v2/cursus', {
				headers: { Authorization: `Bearer ${ accessToken }` },
			})
			.toPromise();
		this.logger.log('this is the data:', data);
		return data;
	}
   */
}
