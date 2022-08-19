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
import { Response, Request } from 'express';
import { User } from '../typeorm/user.entity';
import { UsersService } from '../users/users.service';
import { TwoFactorAuthenticationDto } from './dto'
import * as rawbody from 'raw-body';
import { SessionGuard } from '../auth/session.guard';
 
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

	@Post('generate')
	async register(@Res() response: Response, @Req() request: RequestWithUser) {
		const { otpauthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(request.user);

		return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpauthUrl);
	}
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
}
