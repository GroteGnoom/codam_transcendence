import {
  Body,
  Controller,
  Get,
  Header,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  Res,
  Response,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
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
  async addAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    this.logger.log("id: ", req.session.userId);
    this.logger.log("filename: ", file.originalname);
    return this.userService.addAvatar(req.session.userId, file.buffer,
                                      file.originalname);
  }

  @Get('avatar')
  async getDatabaseFileById(@Req() req: any, @Response({passthrough : true})
                                             res): Promise<StreamableFile> {
    const userId = req.session.userId;
    const avatarId = await this.userService.getAvatarId(userId);
    if (avatarId === null)
      return null;
    const file = await this.databaseFilesService.getFileById(avatarId);
    const stream = Readable.from(file.data);
    res.set({
      'Content-Type' : 'image',
      'Content-Disposition' : `inline;// filename="${file.filename}"`,
    });
    return new StreamableFile(stream);
  }


  // Endpoint needed for chat

  @Get('id/:id')
  findUser(@Param('id') id: number) {                 //need this endpoint to get owner name of a channel
    return this.userService.findUsersById(Number(id));
  }

  @Put('block/:id')
  blockUser(@Param('id') blocked: number, @Req() req: any) {
    const blocker = req.session.userId;  
    console.log("Blocking", blocker, blocked)             
    return this.userService.blockUser(Number(blocker), Number(blocked));
  }
}
