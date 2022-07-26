import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from 'src/users/users.dtos';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'UserExists', async: true })
@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User) private readonly userRepository: Repository<User>,
	) {}

	async getOneOrFail(username: string): Promise<User> {
		// some code which fetch user entity or throw exception
		const User = await this.userRepository.findOneBy({ username : username })
		// if (!User)
		// 	throw new Error("erreur")
		return User;
	}

	createUser(createUserDto: CreateUserDto) {
		const newUser = this.userRepository.create(createUserDto);
		return this.userRepository.save(newUser).catch((e) => { // TODO: this works, but postgres will trow an error; we probably want to validation uniqueness of username upfront
			if (/(username)[\s\S]+(already exists)/.test(e.detail)) {
				throw new BadRequestException(
					'Account with this username already exists',
				);
			}
			return e;
		});
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

	async turnOnTwoFactorAuthentication(userId: number) {
		return this.userRepository.update(userId, {
			isTwoFactorAuthenticationEnabled: true
		});
	}
}
