import { IsNotEmpty, MinLength } from "class-validator";

export class CreateUserDto {
	@IsNotEmpty()
	@MinLength(1) // same as not empty?
	// TODO: add more validation: no special characters etc.
	username: string;

	@IsNotEmpty()
	intraName: string;

	isActive: boolean;
}
