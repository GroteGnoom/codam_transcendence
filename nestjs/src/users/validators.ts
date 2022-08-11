import {BadRequestException, Injectable, Logger} from '@nestjs/common';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator';
import {UsersService} from './users.service';

@ValidatorConstraint({async : true})
@Injectable()
export class uniqueUserConstraint implements ValidatorConstraintInterface {
  constructor(private readonly userService: UsersService) {}

  async validate(username: any) {
    const user = await this.userService.findUsersByName(username);
    if (user)
      return false;
    return true;
  }

  defaultMessage() {
    return "Username already in use";
  }
}

export function IsUniqueUser(validationOptions?: ValidationOptions) {
  return function(object: Object, propertyName: string) {
    registerDecorator({
      name: "IsUniqueUser",
      target : object.constructor,
      propertyName : propertyName,
      options : validationOptions,
      constraints : [],
      validator : uniqueUserConstraint,
    });
  };
}

export function IsNotBlank(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "IsNotBlank",
            target: object.constructor,
            propertyName: propertyName,
            constraints: [],
            options: validationOptions,
            validator: {
              validate(input: string) {
                return input.trim().length > 0;
              }
            }
        });
    };
}
