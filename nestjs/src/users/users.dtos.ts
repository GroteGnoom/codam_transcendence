import {IsNotEmpty} from "class-validator";

import {userStatus} from '../typeorm/user.entity'

import {uniqueUser} from './uniqueUser';

export class UserDto { // Nestjs Data Transfer Object = a class that
                             // defines the values of the body from the request
  @IsNotEmpty()
  // @uniqueUser({message: 'Username already exists. Choose another name.'})
  // TODO: add more validation: no special characters etc.
  username: string;

  @IsNotEmpty()
  intraName: string;

  status: userStatus;

  isTfaEnabled: boolean;
}
