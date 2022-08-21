
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserSecrets } from 'src/typeorm';
import { GameStats } from 'src/typeorm/gameStats.entity';
import { UserDto } from 'src/users/users.dtos';
import { Repository } from 'typeorm';
import { userStatus } from '../typeorm/user.entity';
import { DatabaseFilesService } from './databaseFiles.service';

@Injectable()
export class UsersService {
  constructor(
      @InjectRepository(User) private readonly userRepository: Repository<User>,
      @InjectRepository(UserSecrets) private readonly userSecretRepository: Repository<UserSecrets>,
      @InjectRepository(GameStats) private readonly gameStatsRepository: Repository<GameStats>,
      private readonly databaseFilesService: DatabaseFilesService,
  ) {
    this.userRepository.update({}, { status: userStatus.Offline, inGame: false })  //reset status of user in database in case server was taken down
  }

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
    const newUser = await this.userRepository.create({...body, gameStats: gameStats});
    if (await this.usernameAlreadyExists(newUser.id, newUser.username))
		throw new BadRequestException('account with this username already exists');
	const savedUser = await this.userRepository.save(newUser).catch(
		(e) => {
			throw new BadRequestException(e.message);
		});
    const userSecrets = this.userSecretRepository.create({id: savedUser.id})

	this.userSecretRepository.save(userSecrets).catch(
		(e) => {
			throw new BadRequestException(e.message);
	});
	return savedUser;
  }

  getUsers() {
	  return this.userRepository.find({
		  order: {username: 'ASC'}
	  });
  }

  async getUserSecrets(id: number) {
	  return this.userSecretRepository.findOne({
		  where: { id : id },
	  }).catch( (e) => {
			throw new BadRequestException('could not retrieve user secrets');
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

  async findUsersById(id: number) {
    const user = await this.userRepository.findOne( { // returns first user with id: id
      where: { id : id },
      relations: ['friends', 'gameStats']
    }).catch(
      (e) => {
        throw new BadRequestException(e.message);
      });
    if (!user)
      throw new NotFoundException('user not found');
    return user;
  }

  async findUsersByName(username: string) {
    return this.userRepository.findOne({ where: {username : username} }).catch( (e) => {
			throw new BadRequestException('could not retrieve user');
		});
  }

  async signOutUser(userId: number){
    return this.userRepository.update(userId, {isSignedUp: false}).catch(
      (e) => {
        throw new BadRequestException(e.message);
      });
  }

  async logOutUser(userId: number){
    return this.userRepository.update(userId, {status: userStatus.Offline}).catch(
      (e) => {
        throw new BadRequestException(e.message);
      });
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
    return this.userSecretRepository.update(userId,
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
      if (!(await this.userRepository.findOne({where: {username: name}}).catch( (e) => {
        throw new BadRequestException('could not retrieve user');
      })) && name.length <= 30)
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
    }).catch( (e) => {
			throw new BadRequestException('could not retrieve user');
		});
    if (!user)
      throw new BadRequestException('User does not exist'); 
    user.status = status;
    return this.userRepository.save(user).catch( (e) => {
      throw new BadRequestException(e.message);
    });
  }

  async blockUser(blocker: number, blocked: number) {
    if (blocker === blocked)
      throw new BadRequestException('Can not block self');
    const user = await this.userRepository.findOne({
      where: { id: blocker }
    }).catch( (e) => {
        throw new BadRequestException(e.message);
      });
    if(!user)
      throw new BadRequestException('User does not exist'); 
    if (user.blockedUsers.includes(blocked)) {
      return user;
    }
    user.blockedUsers.push(blocked);
    return this.userRepository.save(user).catch( (e) => {
      throw new BadRequestException(e.message);
    });
  }

  async unblockUser(blocker: number, blocked: number) {
    const user = await this.userRepository.findOne({
      where: { id: blocker }
    }).catch( (e) => {
        throw new BadRequestException(e.message);
    });
    if (!user)
      throw new BadRequestException('User does not exist'); 
    user.blockedUsers = user.blockedUsers.filter((id) => id != blocked);
    return this.userRepository.save(user).catch( (e) => {
      throw new BadRequestException(e.message);
    });
  }

  async isBlocked(blocker: number, id: number) {
    const user = await this.userRepository.findOne({
      where: { id: blocker }
    }).catch( (e) => {
			throw new BadRequestException('could not retrieve user');
		});
    if (!user)
      throw new BadRequestException('User does not exist'); 
    return (user.blockedUsers.includes(id));
  }

  async friendUser(userId: number, friend: number) {
    if (userId === friend)
      throw new BadRequestException('Can not friend self :(');
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friends']
    }).catch( (e) => {
        throw new BadRequestException(e.message);
      });
    if (!user)
      throw new BadRequestException('User does not exist'); 
    if (user.friends.map((user) => user.id).includes(friend)) {
      return user;
    }
    user.friends = [...user.friends, this.newFriend(friend)];
    return this.userRepository.save(user).catch( (e) => {
        throw new BadRequestException(e.message);
    });
  }

  async unfriendUser(userId: number, friend: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friends']
    }).catch( (e) => {
        throw new BadRequestException(e.message);
      });
    if (!user)
      throw new BadRequestException('User does not exist'); 
    user.friends = user.friends.filter((user) => Number(user.id) !== friend);
    return this.userRepository.save(user).catch((e) => {
        throw new BadRequestException(e.message);
      });
  }

  async isFriend(userId: number, friend: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['friends']
    }).catch( (e) => {
        throw new BadRequestException(e.message);
    });
    if (!user)
      throw new BadRequestException('User does not exist'); 
    return (user.friends.map((user) => Number(user.id)).includes(friend))
  }

  private newFriend(userId: number) {
    return {id: userId} as User
  }
}
