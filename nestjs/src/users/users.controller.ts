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
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import {ReservedOrUserEventNames} from 'socket.io/dist/typed-events';
import {UserDto} from 'src/users/users.dtos';
import {UsersService} from 'src/users/users.service';
import {FileInterceptor} from '@nestjs/platform-express';

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
    const userId = req.session.userId;
    return this.userService.findUsersById(userId);
  }

  @Post('create')
  @UsePipes(ValidationPipe)
  createUsers(@Body() body: UserDto) {
    this.logger.log('Creating user...')
    return this.userService.createUser(body);
  }

  @Put('signupuser')
  @UsePipes(ValidationPipe)
  signUpUser(@Req() req: any, @Body() body: UserDto) {
    const userId = req.session.userId;
    return this.userService.signUpUser(userId, body.username);
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
    this.logger.log("userId: " + userId);
    return this.userService.findUsersById(userId);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async addAvatar(@Req() request: any,
                  @UploadedFile() file: Express.Multer.File) {
    this.logger.log(file);
    return this.userService.addAvatar(request.session.userId, file.buffer,
                                      file.originalname);
  }
}
