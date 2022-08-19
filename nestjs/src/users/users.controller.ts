import {
  BadRequestException,
  Body,
  Controller,
  Get, Param, Post,
  Put,
  Req, Response,
  StreamableFile,
  UploadedFile, UseInterceptors,
  UsePipes,
  UseGuards,
  UnsupportedMediaTypeException,
  NotFoundException,
  ParseIntPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserDto } from 'src/users/users.dtos';
import { UsersService } from 'src/users/users.service';
import { Readable } from 'stream';
import { UserValidationPipe } from './uservalidation.pipe'
import { DatabaseFilesService } from './databaseFiles.service';
import { TwoFactorAuthenticationController } from 'src/auth/twoFactorAuthentication.controller';
import { SessionGuard } from '../auth/session.guard';
import { request } from 'http';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService,
              private readonly databaseFilesService: DatabaseFilesService) {};

  @Get()
  @UseGuards(SessionGuard)
  getUsers() {
    return this.userService.getUsers();
  }

  @Get('user')
  @UseGuards(SessionGuard)
  findUsersById(@Req() req: any) {
    return this.userService.findUsersById(req.session.userId)
  }

  @Put('signupuser')
  @UseGuards(SessionGuard)
  @UsePipes(UserValidationPipe)
  signUpUser(@Req() req: any, @Body() body: UserDto) {
    if (body.username === null || body.username === undefined)
      throw new BadRequestException("Username should not be null or undefined");
    return this.userService.signUpUser(req.session.userId, body.username);
  }

  @Put('updateuser')
  @UseGuards(SessionGuard)
  @UsePipes(UserValidationPipe)
  updateUser(@Req() req: any, @Body() body: UserDto) {
    if (body.username === null || body.username === undefined)
      throw new BadRequestException("Username should not be null or undefined");
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

  @Post('avatar')
  @UseGuards(SessionGuard)
  @UseInterceptors(FileInterceptor('file'))
  async addAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) { // UploadedFile to extract file from request
    if (!file)
      throw new BadRequestException("File not provided");
    if (!file.mimetype.includes("image"))
      throw new UnsupportedMediaTypeException("Unsupported Media Type: type must be `image`");
    if (file.size > 2000000)
      throw new BadRequestException("Maximum allowed file size for upload is 2MB");
    return this.userService.addAvatar(req.session.userId, file.buffer,
                                      file.originalname);
  }

  @Get('avatar')
  @UseGuards(SessionGuard)
  async getDatabaseFileById(@Req() req: any,
          @Response({passthrough : true}) res): Promise<StreamableFile> {
    const userId = req.session.userId;
    const avatarId = await this.userService.getAvatarId(userId);
    if (!avatarId)
      throw new NotFoundException('Avatar not found');
    const file = await this.databaseFilesService.getFileById(avatarId);
    if (!file)
      throw new NotFoundException('Avatar not found');
    const stream = Readable.from(file.data);
    res.set({
      'Content-Type' : 'image',
      'Content-Disposition' : `inline;// filename="${file.filename}"`,
    });
    return new StreamableFile(stream);
  }

  @Get('avatar/:id')
  @UseGuards(SessionGuard)
  async getAvatarForUSer(@Param('id') id: number,
          @Response({passthrough : true}) res): Promise<StreamableFile> {
    const avatarId = await this.userService.getAvatarId(id);
    if (!avatarId)
      throw new NotFoundException('Avatar not found');
    const file = await this.databaseFilesService.getFileById(avatarId);
    if (!file)
      throw new NotFoundException('Avatar not found');
    const stream = Readable.from(file.data);
    res.set({
      'Content-Type' : 'image',
      'Content-Disposition' : `inline;// filename="${file.filename}"`,
    });
    return new StreamableFile(stream);
  }

  @Get('id/:id') // TODO user validation
  @UseGuards(SessionGuard)
  findUser(@Param('id', ParseIntPipe) id: number) {                 //need this endpoint to get owner name of a channel
    return this.userService.findUsersById(Number(id));
  }

  @Put('block/:id') // TODO user validation
  @UseGuards(SessionGuard)

  blockUser(@Param('id', ParseIntPipe) blocked: number, @Req() req: any) {
    const blocker = req.session.userId;
    return this.userService.blockUser(Number(blocker), Number(blocked));
  }

  @Put('unblock/:id') // TODO user validation
  @UseGuards(SessionGuard)
  unblockUser(@Param('id', ParseIntPipe) blocked: number, @Req() req: any) {
    const blocker = req.session.userId;
    return this.userService.unblockUser(Number(blocker), Number(blocked));
  }

  @Get('is-blocked/:id')
  @UseGuards(SessionGuard)
  isBlocked(@Param('id') id: number, @Req() req: any) {
    const blocker = req.session.userId;        
    return this.userService.isBlocked(Number(blocker), Number(id));
  }


  @Put('friend/:id') // TODO user validation
  @UseGuards(SessionGuard)
  friendUser(@Param('id') friend: number, @Req() req: any) {
    const userID = req.session.userId;
    return this.userService.friendUser(Number(userID), Number(friend));
  }

  @Put('unfriend/:id') // TODO user validation
  @UseGuards(SessionGuard)
  unfriendUser(@Param('id') friend: number, @Req() req: any) {
    const userID = req.session.userId;  
    return this.userService.unfriendUser(Number(userID), Number(friend));
  }

  @Get('is-friend/:id')
  @UseGuards(SessionGuard)
  isFriend(@Param('id') id: number, @Req() req: any) {
    const userID = req.session.userId;
    return this.userService.isFriend(Number(userID), Number(id));
  }
}
