import { Injectable } from '@nestjs/common';
import { authenticator } from 'otplib';
import { User } from '../typeorm/user.entity';
import { UsersService } from '../users/users.service';
import { toFileStream } from 'qrcode';
import { Response } from 'express';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Injectable()
export class TwoFactorAuthenticationService {
	constructor (
		private readonly usersService: UsersService,
		private readonly configService: ConfigService
	) {}

	public async generateTwoFactorAuthenticationSecret(user: User) {
		const secret = authenticator.generateSecret();

		//const otpauthUrl = authenticator.keyuri(user.email, this.configService.get('TWO_FACTOR_AUTHENTICATION_APP_NAME'), secret);
		const otpauthUrl = authenticator.keyuri("TODO", this.configService.get('TWO_FACTOR_AUTHENTICATION_APP_NAME'), secret);

		//await this.usersService.setTwoFactorAuthenticationSecret(secret, user.id);
		await this.usersService.setTwoFactorAuthenticationSecret(secret, 10); //TODO actual user id

		return {
			secret,
			otpauthUrl
		}
	}
	public async pipeQrCodeStream(stream: Response, otpauthUrl: string) {
		return toFileStream(stream, otpauthUrl);
	}
}
