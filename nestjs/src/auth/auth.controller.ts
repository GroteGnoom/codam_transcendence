import {
	Controller,
	Get,
	Redirect,
	Req,
	UseGuards,
	Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
const util = require('node:util');
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController
{  
	constructor(private authService: AuthService) {}
	private readonly logger = new Logger(AuthController.name);
	@Get('ft')
	@Redirect('http://127.0.0.1:3000/logged_in', 302)
	@UseGuards(AuthGuard('ft')) //before returning the get request this will try the ft strategy for authentication. If ft exists is checked during runtime, and will give Unknown authentication strategy "ft" if it doesn't exist.
	async login(@Req() req: Request): Promise<any> { //the function name doesn't matter?
		const areq = await req;
		//this.logger.log('get on auth/ft request:', util.inspect(areq, false, null, true)); /// HUGE!
		//this.logger.log('get on auth/ft request:', util.inspect(areq.body, false, null, true)); // nothing

		//it's always req.user, even though it's not a user at all :( 
		const user = req.user;
		this.logger.log('get on auth/ft user:', user);
		this.logger.log('type of  user:', user.constructor.name);
		//req.login.then(resp => {this.logger.log("in getLoginName:", resp.data.login);});
		return {url:'http://127.0.0.1:3000/logged_in/thetoken'};
		return this.authService.login(req.user); //should probably put this in a header
		//return user;
	}
	//async getUserFromDiscordLogin(@Req() req): Promise<any> {
		//return req.user;
	//}


	//this will reauire a JWT token
	@Get('test')
	auth_callback() {
		this.logger.log('auth callbackft\n');
	}
  
	@UseGuards(JwtAuthGuard)
	@Get('profile')
	getProfile(@Req() req) {
		return req.user;
	}
}
