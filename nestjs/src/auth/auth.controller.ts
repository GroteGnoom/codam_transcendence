import {
	Controller,
	Get,
	Redirect,
	Req,
	Res,
	UseGuards,
	Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
const util = require('node:util');
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';

import "express-session";
declare module "express-session" {
	export interface SessionData {
		logged_in: boolean;
		userId: number;
		tfa_validated: boolean;
	}
}


@Controller('auth')
export class AuthController
{  
	constructor(private authService: AuthService, 
			   private userService: UsersService) {}
	private readonly logger = new Logger(AuthController.name);
	@Get('ft')
	@Redirect('http://127.0.0.1:3000/logged_in', 302)
	@UseGuards(AuthGuard('ft')) //before returning the get request this will try the ft strategy for authentication. If ft exists is checked during runtime, and will give Unknown authentication strategy "ft" if it doesn't exist.
	async login(@Req() req: Request, @Res() response:Response): Promise<any> { //the function name doesn't matter?
		const areq = await req;
		//this.logger.log('get on auth/ft request:', util.inspect(areq, false, null, true)); /// HUGE!
		//this.logger.log('get on auth/ft request:', util.inspect(areq.body, false, null, true)); // nothing

		//it's always req.user, even though it's not a user at all :( 
		const user = req.user;
		this.logger.log('get on auth/ft user:', user);
		this.logger.log('type of  user:', user.constructor.name);

		const userID = await this.authService.login(user);
		//req.login.then(resp => {this.logger.log("in getLoginName:", resp.data.login);});
		//response.cookie('user', req.user);
		//response.cookie('token', jwt.access_token);
		req.session.logged_in = true;
		//req.session.user = req.user.toString(); //from String to string
		req.session.userId = userID;
		//see also https://stackoverflow.com/questions/14727044/what-is-the-difference-between-types-string-and-string
		return {url:'http://127.0.0.1:3000/'};
		//return user;
	}
	//async getUserFromDiscordLogin(@Req() req): Promise<any> {
		//return req.user;
	//}


	//this will require a JWT token
	@Get('test')
	auth_callback() {
		this.logger.log('auth callbackft\n');
	}
  
	@UseGuards(JwtAuthGuard) // guards checks for jwt
	@Get('profile')
	getProfile(@Req() req) {
		console.log(req.user);
		return req.user;
	}

	@Get('getcookie')
	getCookie(@Res({passthrough: true}) response: Response) {
		response.cookie('key', Date.now())
		return "cookie gezet";
	}

	@Get('showcookie')
	showCookie(@Req() req) {
		this.logger.log(req.cookies);
		return req.cookies;
	}

	/*
	@Get('amiloggedin')
	async amILoggedIn(@Req() req) {
		if (req.cookies['user']) {
			const jwt = await this.authService.login(req.cookies['user']);
			this.logger.log("checking login for", req.cookies['user']);
			this.logger.log("token", req.cookies['token']);
			this.logger.log("should be", jwt.access_token);
			if (req.cookies['token'] && req.cookies['token'] == jwt.access_token) //doesn't work, jwt sign does not just depend on the inputs
				return true;
		}
		return false;
	}
   */

	@Get('amiloggedin')
	amILoggedIn(@Req() request: Request) {
		this.logger.log("logged in?", request.session.logged_in);
		if (request.session.logged_in)
			return true;
		return false;
	}
	@Get('is_tfa_enabled')
	async isTfaEnabled(@Req() request: Request) {
		const user = await this.userService.findUsersById(request.session.userId);
		this.logger.log("tfa enabled?", user.isTfaEnabled);
		if (request.session.logged_in)
			return true;
		return false;
	}

	@Get('user_id')
	getUserId(@Req() request: Request) {
		this.logger.log("getting user name", request.session.userId);
		if (request.session.userId)
			return request.session.userId; 
		return "";
	}

	@Get('intra_name')
	async getUserName(@Req() request: Request) {
		const user = await this.userService.findUsersById(request.session.userId);
		const intraName = user.intraName;
		this.logger.log("getting intra name", intraName);
		if (intraName)
			return intraName; 
		return "";
	}

}
