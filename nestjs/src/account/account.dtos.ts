import { IsNotEmpty, MinLength } from "class-validator";

export class CreateAccount {
	@IsNotEmpty()
	@MinLength(3)
	username: string;
}
