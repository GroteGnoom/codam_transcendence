import {IsNotEmpty, IsAlphanumeric, Max, MaxLength} from "class-validator";
import {userStatus} from '../typeorm/user.entity'
import {IsUniqueUser, IsNotBlank} from './validators';

export class UserDto { // Nestjs Data Transfer Object = a class that defines the values of the body from the request
  @IsNotEmpty()
  @IsNotBlank({message: 'username should not be empty'})
  @MaxLength(30)
  username: string;

  @IsNotEmpty()
  intraName: string;

  status: userStatus;

  isTfaEnabled: boolean;
}
