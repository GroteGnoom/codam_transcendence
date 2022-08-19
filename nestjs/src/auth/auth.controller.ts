import {
	BadRequestException,
	Controller,
	Get, Redirect,
	Req,
	Res,
	UseGuards,
	Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { get_frontend_host } from 'src/utils';
import { GlobalService } from '../global.service';
import { UsersService } from '../users/users.service';
import { SessionGuard } from './session.guard';
const util = require('node:util');

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
	@Get('ft')
	@Redirect(get_frontend_host() + '/logged_in', 302)
	@UseGuards(AuthGuard('ft')) //before returning the get request this will try the ft strategy for authentication. If ft exists is checked during runtime, and will give Unknown authentication strategy "ft" if it doesn't exist.
	async login(@Req() req: Request, @Res() response:Response): Promise<any> { //the function name doesn't matter?
		//it's always req.user, even though it's not a user at all :( 
		const user = req.user;

        //This is required to make the types work, even though user and user2 are both String
        const user2: any = user; 
		const userID = (await this.userService.findOrCreateUser(user2)).id;
		req.session.logged_in = true;
		req.session.userId = userID;
		GlobalService.users.set(req.session.id, Number(userID))
		return {url: get_frontend_host() + '/signup'};
	}

	@Get('fake_ft:name') //TODO remove
	@Redirect(get_frontend_host() + '/logged_in', 302)
	async fakeLogin(@Req() req: Request, @Res() response:Response, @Param('name') intraname: string): Promise<any> { //the function name doesn't matter?
		const userID = (await this.userService.findOrCreateUser(intraname)).id;
		req.session.logged_in = true;
		req.session.userId = userID;
		GlobalService.users.set(req.session.id, Number(userID))
		return {url: get_frontend_host() + '/signup'};
	}

	@Get('uniqueSession')
	async getUniqueSession(@Req() req: Request) {
		return (!(await GlobalService.users.has(req.session.id)))
	}

	@UseGuards(SessionGuard)
	@Get('profile')
	getProfile(@Req() req) {
		return req.user;
	}

	@Get('logout')
	logout(@Req() req) {
		req.session.destroy();
	}

	@Get('amiloggedin')
	amILoggedIn(@Req() request: Request) {
		if (request.session.logged_in)
			return true;
		return false;
	}

	@Get('amitfavalidated')
	amITfaValidated(@Req() request: Request) {
		if (request.session.tfa_validated)
			return true;
		return false;
	}

	@UseGuards(SessionGuard)
	@Get('user_id')
	getUserId(@Req() request: Request) {
		if (request.session.userId)
			return request.session.userId; 
		return "";
	}

	@UseGuards(SessionGuard)
	@Get('intra_name')
	async getUserName(@Req() request: Request) {
		const user = await this.userService.findUsersById(request.session.userId);
		const intraName = user.intraName;
		if (intraName)
			return intraName; 
		return "";
	}

}
