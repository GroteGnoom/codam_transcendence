import {
	Controller,
	Get,
	Req,
	UseGuards,
	Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController
{
	private readonly logger = new Logger(AuthController.name);
	@Get('ft')
	@UseGuards(AuthGuard('ft')) //before returning the get request this will try the ft strategy for authentication. If ft exists is checked during runtime, and will give Unknown authentication strategy "ft" if it doesn't exist.
	functionname() { //the function name doesn't matter?
		this.logger.log('get on auth/ft\n');
		return "ft get request";
	}
	//async getUserFromDiscordLogin(@Req() req): Promise<any> {
		//return req.user;
	//}
}
