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
	Logger,
} from '@nestjs/common';
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';
import { Response, Request } from 'express';
import { User } from '../typeorm/user.entity';
import { UsersService } from '../users/users.service';
import { TwoFactorAuthenticationDto } from './dto'
import * as rawbody from 'raw-body';
 
interface RequestWithUser extends Request {
  user: User;
}
 
export default RequestWithUser;
@Controller('2fa')
@UseInterceptors(ClassSerializerInterceptor)
export class TwoFactorAuthenticationController {
	private readonly logger = new Logger(TwoFactorAuthenticationController.name);
	constructor(
		private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
		private readonly userService: UsersService
	) {}

	@Post('generate')
	//@UseGuards(JwtAuthenticationGuard)
	async register(@Res() response: Response, @Req() request: RequestWithUser) {
		const { otpauthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(request.user);

		return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpauthUrl);
	}
	@Get("generate")
	async register_current_user(@Res() response: Response, @Req() request: RequestWithUser) {
		const user = await this.userService.findUsersById(request.session.userId);
		const { otpauthUrl } = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(user);

		await this.userService.turnOnTwoFactorAuthentication(request.session.userId);
		return this.twoFactorAuthenticationService.pipeQrCodeStream(response, otpauthUrl);
	}

	@Post('turn-on')
	@HttpCode(200)
	//@UseGuards(JwtAuthenticationGuard)
	async turnOnTwoFactorAuthentication(
		@Req() request: RequestWithUser,
		@Body() { twoFactorAuthenticationCode } : TwoFactorAuthenticationDto
	) {
		/*
		const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
			twoFactorAuthenticationCode, request.user
		);
		if (!isCodeValid) {
			throw new UnauthorizedException('Wrong authentication code');
		}
		await this.userService.turnOnTwoFactorAuthentication(request.user.id);
	   */
	}

	@Post('authenticate')
	@HttpCode(200)
	//@UseGuards(JwtAuthenticationGuard)
	async authenticate(
		@Req() request: RequestWithUser,
		@Body() { twoFactorAuthenticationCode } : TwoFactorAuthenticationDto
	) {
		const user = await this.userService.findUsersById(request.session.userId);
		this.logger.log('received 2fa code: ' + twoFactorAuthenticationCode);
		const secret = user.twoFactorAuthenticationSecret;
		this.logger.log("secret: ", secret);
		const isCodeValid = this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
			twoFactorAuthenticationCode, secret
		);
		if (!isCodeValid) {
			this.logger.log('2fa code is incorrect :(');
			throw new UnauthorizedException('Wrong authentication code');
		}
		this.logger.log('2fa code is correct');
		request.session.tfa_validated = true;

		//return request.session.tfa_validated;
		this.logger.log('going to respond');
		return "I am a banana";
	}
}
