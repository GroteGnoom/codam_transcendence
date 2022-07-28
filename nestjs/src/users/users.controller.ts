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
	Req,
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

	@Get('id')
	findUsersById(@Req() req: any) {
		const userID = req.session.userId;
		return this.userService.findUsersById(userID);
	}

	@Post('create')
	@UsePipes(ValidationPipe)
	createUsers(@Body() createUserDto: CreateUserDto) {
		this.logger.log('Creating user...')
		return this.userService.createUser(createUserDto);
	}

	@Post('setusername')
	@UsePipes(ValidationPipe)
	setUsername(username: string) {
		this.logger.log("setUsername called");
		return this.userService.setUsername(username);
	}

	@Get('intraname')
	getIntraname(@Req() req: any) {
		const userId = req.session.userId;
		return this.userService.getIntraname(userId);
	}
}
