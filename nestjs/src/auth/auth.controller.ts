import {
	Controller,
	Get,
	Req,
	UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController
{
	@Get('ft')
	@UseGuards(AuthGuard('ft')) //before returning the get request this will try the ft strategy for authentication. If ft exists is checked during runtime, and will give Unknown authentication strategy "ft" if it doesn't exist.
	functionname() {
		return "ft get request";
	}
	//async getUserFromDiscordLogin(@Req() req): Promise<any> {
		//return req.user;
	//}
}
