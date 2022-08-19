import { BadRequestException, Injectable, Logger, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ValidatorConstraint
} from 'class-validator';
import { User } from 'src/typeorm';
import { GameStats } from 'src/typeorm/gameStats.entity';
import { UserDto } from 'src/users/users.dtos';
import { Repository } from 'typeorm';
import { userStatus } from '../typeorm/user.entity';
import { DatabaseFilesService } from './databaseFiles.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
      @InjectRepository(User) private readonly userRepository: Repository<User>,
      @InjectRepository(GameStats) private readonly gameStatsRepository: Repository<GameStats>,
      private readonly databaseFilesService: DatabaseFilesService,
  ) {}

  async usernameAlreadyExists(userId: number, username: string) {
    // if (userId === undefined || userId === null || username === undefined || username === null) // TODO: kan dit uit na betere validators??
    //   return false;
    const [users, usersCount] = await this.userRepository.findAndCount({where: {username: username}});
    if (usersCount > 1)
      return true;
    if (usersCount == 1 && Number(users[0].id) !== Number(userId)){
      return true;
    }
    return false;
  }

  async createUser(body: UserDto) {
    const gameStats = this.gameStatsRepository.create()
    const newUser = this.userRepository.create({...body, gameStats: gameStats});
    if (await this.usernameAlreadyExists(newUser.id, newUser.username))
      throw new BadRequestException('account with this username already exists');
    return this.userRepository.save(newUser).catch(
      (e) => {
        throw new BadRequestException(e.message);
      });
  }

  filterUserInfo(user: any) {
	  delete user.twoFactorAuthenticationSecret;
	  delete user.isTfaEnabled;
  }

  getUsers() {
	  return this.userRepository.find({
		  order: {username: 'ASC'}
	  }).then((users) => { 
		  users.forEach(this.filterUserInfo);
		  return users;
	  });
  }

  async getAvatarId(id: number) {
    const user = await this.userRepository.findOneBy({id : id}).catch( // returns the first user with id: id
      (e) => {
        throw new BadRequestException(e.message);
      });
    if (!user)
      return null;
    return user.avatarId;
  }
  
  setUsername(userId: number, username: string) {
    if (this.usernameAlreadyExists(userId, username))
      throw new BadRequestException('account with this username already exists');
    return this.userRepository.update(userId, {username : username});
  }

  findUsersById(id: number) {
    return this.userRepository.findOne( { // returns first user with id: id
      where: { id : id },
      relations: ['friends', 'gameStats']
    }).then((user) => { 
		this.filterUserInfo(user);
		user.friends.forEach(this.filterUserInfo);
		return user;
	  });
  }

  findUsersByName(username: string) {
    return this.userRepository.findOne({ where: {username : username} });
  }

  signOutUser(userId: number){
    return this.userRepository.update(userId, {isSignedUp: false}).catch(
      (e) => {
        throw new BadRequestException(e.message);
      });
  }

  logOutUser(userId: number){
    return this.userRepository.update(userId, {status: userStatus.Offline}).catch(
      (e) => {
        throw new BadRequestException(e.message);
      });
  }

  findUsersByIntraname(intraName: string) {
    return this.userRepository.findOne({ where: {intraName : intraName} });
  }

  async signUpUser(userId: number, username: string) {
    if (await this.usernameAlreadyExists(userId, username))
      throw new BadRequestException('account with this username already exists');
    return this.userRepository.update(userId, {username : username, isSignedUp : true}).catch(
      (e) => {
        throw new BadRequestException(e.message);
      });
  }

  async updateUser(userId: number, username: string, isTfaEnabled: boolean) {
    if (await this.usernameAlreadyExists(userId, username))
      throw new BadRequestException('account with this username already exists');
    // userId cannot be undefined because of sessionguard
    return this.userRepository.update(userId, {username : username, isTfaEnabled : isTfaEnabled}).catch(
      (e) => {
        throw new BadRequestException(e.message);
      });
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
    var unique = false;
    var name = "";
    while (!unique) {
      name = await fetch("http://names.drycodes.com/1")
        .then(response => response.json())
        .then((response) => response[0]);
      if (!(await this.userRepository.findOne({where: {username: name}})) && name.length <= 30)
        unique = true;
    }
    return name;
  }

  // adds user logged in through intra
  // intraname is only set here; it is not possible to change later
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

  async addAvatar(userId: number, imageBuffer: Buffer, filename: string) {
    const avatarIdBefore = await this.getAvatarId(userId);
    const avatar = await this.databaseFilesService.uploadDatabaseFile(
        avatarIdBefore, imageBuffer, filename); // save the avatar in the database.file
    if (avatarIdBefore === null){
      await this.userRepository.update(
          userId,
          {avatarId : avatar.id}).catch(
            (e) => {
              throw new BadRequestException(e.message);
            }); // save the id of the avatar in user repository (only with new avatar id)
    }
    return avatar;
  }
  
  async setStatus(userId: number, status : userStatus){
    const user = await this.userRepository.findOne({
      where: { id: userId }
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
    return this.userRepository;
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
    user.friends = [...user.friends, this.newFriend(friend)];
    return this.userRepository.save(user);
  }

  async unfriendUser(userId: number, friend: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friends']
    });
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
