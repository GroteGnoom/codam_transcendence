import {IsNotEmpty} from "class-validator";
import {userStatus} from '../typeorm/user.entity'
import {IsUniqueUser, IsNotBlank} from './validators';

export class UserDto { // Nestjs Data Transfer Object = a class that defines the values of the body from the request
  @IsNotEmpty()
  @IsUniqueUser({message: 'Username $value already exists. Choose another name.'})
  @IsNotBlank({message: 'Blank username not possible'})
  // @IsUniqueUser({message: 'Username already exists. Choose another name.'})
  // TODO: add more validation: no special characters etc. for sql injections
  username: string;

  @IsNotEmpty()
  intraName: string;

  status: userStatus;

  isTfaEnabled: boolean;
}
