import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';
import { User } from '../typeorm/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class TwoFactorAuthenticationService {
	constructor (
		private readonly usersService: UsersService,
		private readonly configService: ConfigService
	) {}

	public async generateTwoFactorAuthenticationSecret(user: User) {
		const secret = authenticator.generateSecret();

		const otpauthUrl = authenticator.keyuri(user.intraName, this.configService.get('TWO_FACTOR_AUTHENTICATION_APP_NAME'), secret);

		await this.usersService.setTmpTfaSecret(secret, user.id);

		return {
			secret,
			otpauthUrl
		}
	}
	public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
		return toFileStream(stream, otpauthUrl);
	}

	public isTwoFactorAuthenticationCodeValid(twoFactorAuthenticationCode: string, secret: string) {
		return authenticator.verify({
			token: twoFactorAuthenticationCode,
			secret
		})
	}
}
