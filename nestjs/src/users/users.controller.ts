import {
  Body,
  Controller,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {ReservedOrUserEventNames} from 'socket.io/dist/typed-events';
import {CreateUserDto} from 'src/users/users.dtos';
import {UsersService} from 'src/users/users.service';

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

  @Put('signupuser')
  @UsePipes(ValidationPipe)
  signUpUser(username: string, intraName: string) {
    this.logger.log('Signup user...');
    this.logger.log(intraName, username);
    return this.userService.signUpUser(username, intraName);
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
