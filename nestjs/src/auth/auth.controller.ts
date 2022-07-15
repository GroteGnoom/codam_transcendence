import {
	Controller,
	Get,
	Req,
//	UseGuards,
} from '@nestjs/common';
//import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController
{
	@Get('ft')
	functionname() {
		return "ft get request";
	}
	//@UseGuards(AuthGuard('ft'))
	//async getUserFromDiscordLogin(@Req() req): Promise<any> {
		//return req.user;
	//}
}
