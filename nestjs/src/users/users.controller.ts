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
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {ReservedOrUserEventNames} from 'socket.io/dist/typed-events';
import {UserDto} from 'src/users/users.dtos';
import {UsersService} from 'src/users/users.service';
import {Readable} from 'stream';

import {DatabaseFilesService} from './databaseFiles.service';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private readonly userService: UsersService,
              private readonly databaseFilesService: DatabaseFilesService) {};

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
  async addAvatar(@Req() req: any,
                  @UploadedFile() file: Express.Multer.File) {
    this.logger.log("id: ", req.session.userId);
    this.logger.log("filename: ", file.originalname);
    return this.userService.addAvatar(req.session.userId, file.buffer,
                                      file.originalname);
  }

  @Get('avatar')
  async getDatabaseFileById(@Req() req: any,
                            @Res({passthrough : true}) response: Response) {
    const userId = req.session.userId;
    const id = await this.userService.getAvatarId(userId);
    const file = await this.databaseFilesService.getFileById(id);
    const stream = Readable.from(file.data);
    // response.set({
    //   'Content-Disposition' : `inline; filename="${file.filename}"`,
    //   'Content-Type' : 'image'
    // })
    return new StreamableFile(stream);
  }
}
