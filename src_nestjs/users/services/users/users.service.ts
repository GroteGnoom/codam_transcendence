import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from 'src/users/dto/users.dtos';

@Injectable()
export class UsersService {
	private readonly users: User[];
	constructor(
		@InjectRepository(User) private readonly userRepository: Repository<User>,
	) {
		this.users = [
			{
				id    : 1,
				username      : 'bob',
				email: 'bla@example.com',
				password: 'pwd123',
				ftId: '1234sfaf',
			},
		];
	}

	createUser(createUserDto: CreateUserDto) {
		const newUser = this.userRepository.create(createUserDto);
		//console.log(createUserDto)
		return this.userRepository.save(newUser);
	}

	getUsers() {
		return this.userRepository.find();
	}

	findUsersById(id: number) {
		return this.userRepository.findOneBy({id: id});
	}

	async findOne(
		field: string,
		ftId: string,
	): Promise<User | undefined> {
		return this.users.find(user => user[field] === ftId);
	}
}
