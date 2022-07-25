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
	Body,
	UnauthorizedException, HttpCode,
} from '@nestjs/common';
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';
import { Response } from 'express';
import { User } from '../typeorm/user.entity';
import { UsersService } from '../users/users.service';
import { TwoFactorAuthenticationDto } from './dto'
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
		private readonly usersService: UsersService
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

	@Post('turn-on')
	@HttpCode(200)
	//@UseGuards(JwtAuthenticationGuard)
	async turnOnTwoFactorAuthentication(
		@Req() request: RequestWithUser,
		@Body() { twoFactorAuthenticationCode } : TwoFactorAuthenticationDto
	) {
		const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
			twoFactorAuthenticationCode, request.user
		);
		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}
		await this.usersService.turnOnTwoFactorAuthentication(request.user.id);
	}

	@Post('authenticate')
	@HttpCode(200)
	//@UseGuards(JwtAuthenticationGuard)
	async authenticate(
		@Req() request: RequestWithUser,
		@Body() { twoFactorAuthenticationCode } : TwoFactorAuthenticationDto
	) {
		const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
			twoFactorAuthenticationCode, request.user
		);
		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}

		//const accessTokenCookie = this.authenticationService.getCookieWithJwtAccessToken(request.user.id, true);

		//request.res.setHeader('Set-Cookie', [accessTokenCookie]);
		//TODO set user to authenticated

		return request.user;
	}
}
