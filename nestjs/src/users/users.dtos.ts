import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { userStatus } from '../typeorm/user.entity';
import { IsNotBlank } from './validators';

export class UserDto { // Nestjs Data Transfer Object = a class that defines the
                       // values of the body from the request
                       // overall checks for values are in here
  // @IsDefined() // is not null or undefined, otherwise give error
  // decorators are executed bottom-to-top
  @MaxLength(30)
  @IsNotBlank({message : 'username must not be empty'})
  @IsNotEmpty()
  @IsString()
  @IsOptional() //Checks if given value is empty (=== null, === undefined) and if so, ignores all the validators on the property.
  username: string;

  @MaxLength(8)
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  intraName: string;

  @IsEnum(userStatus)
  @IsOptional()
  status: userStatus;

  @IsBoolean()
  @IsOptional()
  isTfaEnabled: boolean;
}
