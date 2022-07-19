import { IsNotEmpty } from "class-validator";

export class CreateChannelDto {
	@IsNotEmpty()
	name: string;

	@IsNotEmpty()
	owner: number;

	password?: string;
}
