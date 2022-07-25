import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Post,
	UsePipes,
	ValidationPipe,
	Logger,
} from '@nestjs/common';
import { CreateUserDto } from 'src/users/users.dtos';
import { UsersService } from 'src/users/users.service';

@Controller('users')
export class UsersController {
	private readonly logger = new Logger(UsersController.name);
	constructor(private readonly userService: UsersService) {}

	@Get()
	getUsers() {
		this.logger.log('getting users\n');
		return this.userService.getUsers();
	}

	@Get('id/:id')
	findUsersById(@Param('id', ParseIntPipe) id: number) {
		return this.userService.findUsersById(id);
	}

	@Post('create')
	@UsePipes(ValidationPipe)
	createUsers(@Body() createUserDto: CreateUserDto) {
		this.logger.log('Created user')
		return this.userService.createUser(createUserDto);
	}

	@Post('setusername')
	@UsePipes(ValidationPipe)
	setUsername(username: string) {
		this.logger.log("setUsername called");
		return this.userService.setUsername(username);
	}
}
