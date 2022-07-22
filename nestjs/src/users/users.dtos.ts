import { IsNotEmpty, MinLength } from "class-validator";

export class CreateUserDto {
	@IsNotEmpty()
	@MinLength(1) // same as not empty?
	username: string;
}
