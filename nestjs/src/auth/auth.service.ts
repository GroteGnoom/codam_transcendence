import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
	constructor(
		private jwtService: JwtService,
		private readonly userService: UsersService
	) {}

	/*
	async validateUser(username: string, pass: string): Promise<any> {
		const user = await this.usersService.findOne(username);
		if (user && user.password === pass) {
			const { password, ...result } = user;
			return result;
		}
		return null;
	}
   */

	async login(username: any) {
		const user = await this.userService.findOrCreateUser(username);
		const payload = { username: username, userID : user.id} ;
		return {
			access_token: this.jwtService.sign(payload),
		};
	}
}

