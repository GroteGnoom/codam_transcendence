import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from 'src/users/users.dtos';

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User) private readonly userRepository: Repository<User>,
	) {}

	createUser(createUserDto: CreateUserDto) {
		const newUser = this.userRepository.create(createUserDto);
		return this.userRepository.save(newUser);
	}

	getUsers() {
		return this.userRepository.find();
	}

	setUsername(username: string) {
		// return this.userRepository.save(username);
	}

	findUsersById(id: number) {
		return this.userRepository.findOneBy({id: id});
	}
	findUsersByName(username: string) {
		return this.userRepository.findOneBy({ username : username });
	}
  
	async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
		return this.userRepository.update(userId, {
			twoFactorAuthenticationSecret: secret
		});
	}
}
