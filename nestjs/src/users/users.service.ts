import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ValidatorConstraint
} from 'class-validator';
import { User } from 'src/typeorm';
import { UserDto } from 'src/users/users.dtos';
import { Repository } from 'typeorm';

import { userStatus } from '../typeorm/user.entity';

import { DatabaseFilesService } from './databaseFiles.service';

@ValidatorConstraint({name : 'UserExists', async : true})
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
      @InjectRepository(User) private readonly userRepository: Repository<User>,
      private readonly databaseFilesService: DatabaseFilesService,
  ) {}

  async getOneOrFail(username: string): Promise<User> {
    // some code which fetch user entity or throw exception
    const User = await this.userRepository.findOneBy({username : username})
    // if (!User)
    // 	throw new Error("erreur")
    return User;
  }

  createUser(body: UserDto) {
    const newUser = this.userRepository.create(body);
    return this.userRepository.save(newUser).catch(
        (e) => { // TODO: this works, but postgres will trow an error; we
                 // probably want to validation uniqueness of username upfront;
                 // besides, id plusses?
          if (/(intraName)[\s\S]+(already exists)/.test(e.detail)) {
            throw new BadRequestException(
                'Account with this intraName already exists',
            );
          } else if (/(username)[\s\S]+(already exists)/.test(e.detail)) {
            throw new BadRequestException(
                'Account with this username already exists',
            );
          }
          return e;
        });
  }

  getUsers() { return this.userRepository.find(); }

  async getAvatarId(id: number) {
    return (await this.userRepository.findOneBy({id : id})).avatarId;
  }

  setUsername(userId: number, username: string) {
    return this.userRepository.update(userId, {username : username});
  }

  findUsersById(id: number) {
    return this.userRepository.findOne( { 
      where: { id : id },
      relations: ['friends']             
    });
  }

  findUsersByName(username: string) {
    return this.userRepository.findOneBy({username : username});
  }

  signOutUser(userId: number){
    return this.userRepository.update(userId, {isSignedUp: false});
  }

  findUsersByIntraname(intraName: string) {
    return this.userRepository.findOneBy({intraName : intraName});
  }

  signUpUser(userId: number, username: string) {
    return this.userRepository.update(userId, {username : username, isSignedUp : true});
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
    return this.userRepository.update(userId,
                                      {twoFactorAuthenticationSecret : secret});
  }

  async turnOnTwoFactorAuthentication(userId: number) {
    return this.userRepository.update(userId, {isTfaEnabled : true});
  }

  async generateName() {
    return fetch("http://names.drycodes.com/1")
        .then(response => response.json())
        .then((response) => response[0]);
  }

  // adds user logged in through intra
  async findOrCreateUser(intraName: string) {
    const user = await this.userRepository.findOneBy({intraName : intraName});
    if (user)
      return user;
    const dto = new UserDto;
    dto.intraName = intraName;
    dto.username = await this.generateName();
    dto.status = userStatus.Online;
    return this.createUser(dto);
  }

  async addAvatar(id: number, imageBuffer: Buffer, filename: string) {
    const avatarIdBefore = await this.getAvatarId(id);
    const avatar = await this.databaseFilesService.uploadDatabaseFile(
        avatarIdBefore, imageBuffer, filename);
    this.logger.log(avatar.id);
    this.logger.log(avatar.filename);
    if (avatarIdBefore === null){
      await this.userRepository.update(
          id,
          {avatarId : avatar.id}); // save the id of the avatar in user repository
    }
    return avatar;
  }
  
  async setStatus(userID: number, status : userStatus){
    const user = await this.userRepository.findOne({
      where: { id: userID }
    });
    if (!user)
      return;
    user.status = status;
    return this.userRepository.save(user);
  }

  async blockUser(blocker: number, blocked: number) {
    const user = await this.userRepository.findOne({
      where: { id: blocker }
    });
    if (user.blockedUsers.includes(blocked)) {
      return user;
    }
    user.blockedUsers.push(blocked);
    return this.userRepository.save(user); 
  }

  async unblockUser(blocker: number, blocked: number) {
    const user = await this.userRepository.findOne({
      where: { id: blocker }
    });
    user.blockedUsers = user.blockedUsers.filter((id) => id != blocked);
    return this.userRepository.save(user); 
  }

  async isBlocked(blocker: number, id: number) {
    const user = await this.userRepository.findOne({
      where: { id: blocker }
    });
    return  (user.blockedUsers.includes(id));
  }

  async friendUser(userId: number, friend: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friends']
    });
    if (user.friends.map((user) => user.id).includes(friend)) {
      return user;
    }
    // const friends = [...user.friends, this.newFriend(friend)];
    // return this.userRepository.save({id: userId, friends: friends});
    user.friends = [...user.friends, this.newFriend(friend)];
    return this.userRepository.save(user);
  }

  async unfriendUser(userId: number, friend: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friends']
    });
    // const friends = user.friends.filter((user) => user.id != friend)
    // return this.userRepository.save({id: userId, friends: friends}); 
    user.friends = user.friends.filter((user) => Number(user.id) !== friend)
    return this.userRepository.save(user);
  }

  async isFriend(userId: number, friend: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friends']
    });
    return (user.friends.map((user) => Number(user.id)).includes(friend))
  }

  private newFriend(userId: number) {
    return {id: userId} as User
  }
}
