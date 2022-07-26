import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		private configService: ConfigService,
	) {
		super({
			jwtFromRequest: function(req) {
				var token = null;
				if (req && req.cookies) {
					token = req.cookies['token'];
				}
				return token;
			},
			ignoreExpiration: false,
			secretOrKey: configService.get('JWT_SECRET'),
		});
	}

	async validate(payload: any) {
		return { userId: payload.sub, username: payload.username };
	}
}

