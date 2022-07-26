import { Injectable, BadRequestException } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface, ValidationOptions, registerDecorator } from 'class-validator';
import { UsersService } from './users.service';

@ValidatorConstraint({ name: "uniqueUser", async: true })
export class uniqueUserConstraint implements ValidatorConstraintInterface {
    constructor(private usersService: UsersService) {}

    async validate(username: string) {
        const User = this.usersService.getOneOrFail(username);
        if (User)
            return false;
        return true;
    }

    defaultMessage(args: ValidationArguments) { 
        return "Username already in use";
    }
}

export function uniqueUser(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: uniqueUserConstraint,
        });
    };
}
