import {
	ClassSerializerInterceptor,
	Controller,
	Header,
	Post,
	UseInterceptors,
	Res,
	UseGuards,
	Req,
	Get,
} from '@nestjs/common';
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';
import { Response } from 'express';
import { User } from '../typeorm/user.entity';
//import JwtAuthenticationGuard from '../jwt-authentication.guard';
//import RequestWithUser from '../requestWithUser.interface';
 
interface RequestWithUser extends Request {
  user: User;
}
 
export default RequestWithUser;
@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
	constructor(
		private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
	) {}

	@Post('generate')
	//@UseGuards(JwtAuthenticationGuard)
	async register(@Res() response: Response, @Req() request: RequestWithUser) {
		const { otpauthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(request.user);

		return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpauthUrl);
	}
	@Get("generate")
	warning() { 
		return "you're supposed to POST!"
	}
}
