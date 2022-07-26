import { Injectable, BadRequestException, Logger} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from 'src/users/users.dtos';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'UserExists', async: true })
@Injectable()
export class UsersService {
	private readonly logger = new Logger(UsersService.name);
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
		return this.userRepository.save(newUser).catch((e) => { // TODO: this works, but postgres will trow an error; we probably want to validation uniqueness of username upfront; besides, id plusses?
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
		this.logger.log("called setTwoFactorAuthenticationSecret");
		/*
		const user = {
			username: "testName",
			intraName: "testIntra",
			isActive: true,
		}
		const newUser = this.userRepository.create(user);
		this.userRepository.save(newUser);
	   */
		return this.userRepository.update(userId, {
			twoFactorAuthenticationSecret: secret
		});
	}

	async turnOnTwoFactorAuthentication(userId: number) {
		return this.userRepository.update(userId, {
			isTwoFactorAuthenticationEnabled: true
		});
	}

	// adds user logged in through intra
	async findOrCreateUser(intraName: string) {
		const user = await this.userRepository.findOneBy({ intraName : intraName });
		if (user)
			return user;
		const dto = new CreateUserDto;
		dto.intraName = intraName;
		dto.username = intraName;
		dto.isActive = true;
		return this.createUser(dto);
	}
}
