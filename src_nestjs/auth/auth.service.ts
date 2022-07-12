import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/services/users/users.service';


@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
	) {
	}

	async findUserFromFtId(ftId: string): Promise<any> {
		const user = await this.usersService.findOne('ft_id', ftId);

		if ( !user ) {
			throw new Error("user not found!");
		}

		return user;
	}
}
