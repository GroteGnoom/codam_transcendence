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
import { SessionGuard } from './session.guard';
import { UsersService } from '../users/users.service';
import { GlobalService } from '../global.service';
import { get_frontend_host } from 'src/utils';

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
	constructor( private userService: UsersService) {}
	private readonly logger = new Logger(AuthController.name);
	@Get('ft')
	@Redirect(get_frontend_host() + '/logged_in', 302)
	@UseGuards(AuthGuard('ft')) //before returning the get request this will try the ft strategy for authentication. If ft exists is checked during runtime, and will give Unknown authentication strategy "ft" if it doesn't exist.
	async login(@Req() req: Request, @Res() response:Response): Promise<any> { //the function name doesn't matter?
		const areq = await req;
		//it's always req.user, even though it's not a user at all :( 
		const user = req.user;
		this.logger.log('get on auth/ft user:', user);
		this.logger.log('type of  user:', user.constructor.name);

        //This is required to make the types work, even though user and user2 are both String
        const user2: any = user; 
		this.logger.log('type of  user2:', user2.constructor.name);
		const userID = (await this.userService.findOrCreateUser(user2)).id;
		req.session.logged_in = true;
		req.session.userId = userID;
		// console.log("session id in authcontroller:", req.session.id);
		// if (GlobalService.users.has(req.session.id as string)){
		// 	console.log("already an active session")
		// }
		GlobalService.users.set(req.session.id, Number(userID))
		return {url: get_frontend_host() + '/signup'};
	}

	@Get('uniqueSession')
	getUniqueSession(@Req() req: Request) {
		for(let key of GlobalService.users.keys()) {
			console.log(key);
		}
		this.logger.log("unique session?", GlobalService.users.has(req.session.id));
		return (!GlobalService.users.has(req.session.id))
	}

	@UseGuards(SessionGuard)
	@Get('profile')
	getProfile(@Req() req) {
		console.log(req.user);
		return req.user;
	}

	@Get('logout')
	logout(@Req() req) {
		console.log('logging out');
		req.session.destroy();
	}

	@Get('amiloggedin')
	amILoggedIn(@Req() request: Request) {
		this.logger.log("logged in?", request.session.logged_in);
		if (request.session.logged_in)
			return true;
		return false;
	}
	@UseGuards(SessionGuard)
	@Get('is_tfa_enabled')
	async isTfaEnabled(@Req() request: Request) {
		const user = await this.userService.findUsersById(request.session.userId);
		this.logger.log("tfa enabled?", user.isTfaEnabled);
		if (request.session.logged_in)
			return true;
		return false;
	}

	@UseGuards(SessionGuard)
	@Get('user_id')
	getUserId(@Req() request: Request) {
		this.logger.log("getting user name", request.session.userId);
		if (request.session.userId)
			return request.session.userId; 
		return "";
	}

	@UseGuards(SessionGuard)
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
