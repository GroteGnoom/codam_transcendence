import {
	Controller,
	Get,
	Req,
	UseGuards,
	Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
const util = require('node:util');

@Controller('auth')
export class AuthController
{
	private readonly logger = new Logger(AuthController.name);
	@Get('ft')
	@UseGuards(AuthGuard('ft')) //before returning the get request this will try the ft strategy for authentication. If ft exists is checked during runtime, and will give Unknown authentication strategy "ft" if it doesn't exist.
	async getLoginName(@Req() req: Request): Promise<any> { //the function name doesn't matter?
		const areq = await req;
		//this.logger.log('get on auth/ft request:', util.inspect(areq, false, null, true)); /// HUGE!
		//this.logger.log('get on auth/ft request:', util.inspect(areq.body, false, null, true)); // nothing
		const user = req.user;
		this.logger.log('get on auth/ft user:', user);
		this.logger.log('type of  user:', user.constructor.name);
		//req.login.then(resp => {this.logger.log("in getLoginName:", resp.data.login);});
		return user;
	}
	//async getUserFromDiscordLogin(@Req() req): Promise<any> {
		//return req.user;
	//}
	@Get('callback')
	auth_callback() {
		this.logger.log('auth callbackft\n');
	}
}
