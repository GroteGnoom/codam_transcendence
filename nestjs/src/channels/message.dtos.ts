import { IsNotEmpty } from "class-validator";

export class MessageDto {
	@IsNotEmpty()
	sender: number

	@IsNotEmpty()
	text: string;
}
