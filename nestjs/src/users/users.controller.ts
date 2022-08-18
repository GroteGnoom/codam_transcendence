import {
  BadRequestException,
  Body,
  Controller,
  Get, Logger, Param, Post,
  Put,
  Req, Response,
  StreamableFile,
  UploadedFile, UseInterceptors,
  UsePipes,
  UseGuards,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserDto } from 'src/users/users.dtos';
import { UsersService } from 'src/users/users.service';
import { Readable } from 'stream';
import { UserValidationPipe } from './uservalidation.pipe'
import { DatabaseFilesService } from './databaseFiles.service';
import { TwoFactorAuthenticationController } from 'src/auth/twoFactorAuthentication.controller';
import { SessionGuard } from '../auth/session.guard';

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

  @Get('user')
  findUsersById(@Req() req: any) {
    return this.userService.findUsersById(req.session.userId)
  }

  @Post('create')
  @UseGuards(SessionGuard)
  @UsePipes(UserValidationPipe)
  createUser(@Body() body: UserDto) {
    this.logger.log('Creating user...');
    return this.userService.createUser(body);
  }

  @Put('signupuser')
  @UseGuards(SessionGuard)
  @UsePipes(UserValidationPipe)
  signUpUser(@Req() req: any, @Body() body: UserDto) {
    this.logger.log('Signup user...');
    return this.userService.signUpUser(req.session.userId, body.username);
  }

  @Put('updateuser')
  @UseGuards(SessionGuard)
  @UsePipes(UserValidationPipe)
  updateUser(@Req() req: any, @Body() body: UserDto) {
    return this.userService.updateUser(req.session.userId, body.username, body.isTfaEnabled);
  }

  @Put('signoutuser')
  @UseGuards(SessionGuard)
  signOutUser(@Req() req: any) {
    return this.userService.signOutUser(req.session.userId);
  }

  @Put('logoutuser')
  @UseGuards(SessionGuard)
  logOutUser(@Req() req: any) {
    return this.userService.logOutUser(req.session.userId);
  }

  @Post('setusername')
  @UseGuards(SessionGuard)
  @UsePipes(UserValidationPipe)
  setUsername(@Req() req: any, username: string) {
    this.logger.log("setUsername called");
    return this.userService.setUsername(req.session.userId, username);
  }

  @Post('avatar')
  @UseGuards(SessionGuard)
  @UseInterceptors(FileInterceptor('file'))
  async addAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    this.logger.log("id: ", req.session.userId);
    this.logger.log("file size: ", file.size);
    this.logger.log("filename: ", file.originalname);
    this.logger.log("mimetype: ", file.mimetype);
    if (!file.mimetype.includes("image"))
      throw new UnsupportedMediaTypeException("Unsupported Media Type: type must be `image`");
    if (file.size > 2000000)
      throw new BadRequestException("Maximum allowed file size for upload is 2MB");
    return this.userService.addAvatar(req.session.userId, file.buffer,
                                      file.originalname);
  }

  @Get('avatar')
  @UseGuards(SessionGuard)
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

  @Get('avatar/:id')
  @UseGuards(SessionGuard)
  async getAvatarForUSer(@Param('id') id: number, @Response({passthrough : true})
                                             res): Promise<StreamableFile> {
    const avatarId = await this.userService.getAvatarId(id);
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
  @UseGuards(SessionGuard)
  findUser(@Param('id') id: number) {                 //need this endpoint to get owner name of a channel
    return this.userService.findUsersById(Number(id));
  }

  @Put('block/:id')
  @UseGuards(SessionGuard)
  blockUser(@Param('id') blocked: number, @Req() req: any) {
    const blocker = req.session.userId;  
    console.log("Blocking", blocker, blocked)             
    return this.userService.blockUser(Number(blocker), Number(blocked));
  }

  @Put('unblock/:id')
  @UseGuards(SessionGuard)
  unblockUser(@Param('id') blocked: number, @Req() req: any) {
    const blocker = req.session.userId;  
    console.log("UNblocking", blocker, blocked)             
    return this.userService.unblockUser(Number(blocker), Number(blocked));
  }

  @Get('is-blocked/:id')
  @UseGuards(SessionGuard)
  isBlocked(@Param('id') id: number, @Req() req: any) {
    const blocker = req.session.userId;        
    return this.userService.isBlocked(Number(blocker), Number(id));
  }


  @Put('friend/:id')
  @UseGuards(SessionGuard)
  friendUser(@Param('id') friend: number, @Req() req: any) {
    const userID = req.session.userId;  
    console.log("Befriending", userID, friend)             
    return this.userService.friendUser(Number(userID), Number(friend));
  }

  @Put('unfriend/:id')
  @UseGuards(SessionGuard)
  unfriendUser(@Param('id') friend: number, @Req() req: any) {
    const userID = req.session.userId;  
    console.log("UNfriending", userID, friend)             
    return this.userService.unfriendUser(Number(userID), Number(friend));
  }

  @Get('is-friend/:id')
  @UseGuards(SessionGuard)
  isFriend(@Param('id') id: number, @Req() req: any) {
    const userID = req.session.userId;        
    return this.userService.isFriend(Number(userID), Number(id));
  }
}
