import {
	Body, ClassSerializerInterceptor,
	Controller, Get, HttpCode, Post, Req, Res, UnauthorizedException, UseGuards, UseInterceptors
} from '@nestjs/common';
import { Request, Response } from 'express';
import { SessionGuard } from '../auth/session.guard';
import { User } from '../typeorm/user.entity';
import { UsersService } from '../users/users.service';
import { TwoFactorAuthenticationDto } from './dto';
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';
 
interface RequestWithUser extends Request {
  user: User;
}
 
export default RequestWithUser;
@UseGuards(SessionGuard)
@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
	constructor(
		private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
		private readonly userService: UsersService
	) {}

	@Get("generate")
	async register_current_user(@Res() response: Response, @Req() request: RequestWithUser) {
		const user = await this.userService.findUsersById(request.session.userId);
		const { otpauthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(user);

		// await this.userService.turnOnTwoFactorAuthentication(request.session.userId);
		return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpauthUrl);
	}

	@Post('authenticate')
	@HttpCode(200)
	//@UseGuards(JwtAuthenticationGuard)
	async authenticate(
		@Req() request: RequestWithUser,
		@Body() { twoFactorAuthenticationCode } : TwoFactorAuthenticationDto
	) {
		const user = await this.userService.findUsersById(request.session.userId);
		const secrets = await this.userService.getUserSecrets(request.session.userId)
		const secret = secrets.twoFactorAuthenticationSecret;
		const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
			twoFactorAuthenticationCode, secret
		);
		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}
		request.session.tfa_validated = true;
		return await this.userService.turnOnTwoFactorAuthentication(request.session.userId);
	}

	@Post('auth_tmp_set')
	@HttpCode(200)
	//@UseGuards(JwtAuthenticationGuard)
	async auth_tmp_set(
		@Req() request: RequestWithUser,
		@Body() { twoFactorAuthenticationCode } : TwoFactorAuthenticationDto
	) {
		const user = await this.userService.findUsersById(request.session.userId);
		const secrets = await this.userService.getUserSecrets(request.session.userId)
		const secret = secrets.tmpTfaSecret;
		const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
			twoFactorAuthenticationCode, secret
		);
		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}
		request.session.tfa_validated = true;
		await this.userService.setTwoFactorAuthenticationSecret(secret, request.session.userId);
		return await this.userService.turnOnTwoFactorAuthentication(request.session.userId);
	}
}
