import {IsAlphanumeric, IsNotEmpty, Max, MaxLength, IsDefined, IsIn, IsString, IsBoolean, IsEnum, IsOptional} from "class-validator";
import {userStatus} from '../typeorm/user.entity'
import {IsNotBlank, IsUniqueUser} from './validators';

export class UserDto { // Nestjs Data Transfer Object = a class that defines the
                       // values of the body from the request
  @IsNotEmpty()
  @IsNotBlank({message : 'Username must not be empty'})
  @MaxLength(30)
  @IsDefined()
  username: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(8)
  intraName: string;

  @IsIn([userStatus.Offline, userStatus.Online])
  @IsEnum(userStatus)
  status: userStatus;

  @IsBoolean()
  @IsOptional()
  isTfaEnabled: boolean;
}
