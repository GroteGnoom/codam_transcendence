import { IsNotEmpty } from "class-validator";

export class MessageDto {
	@IsNotEmpty()
	sender: number

	@IsNotEmpty()
	text: string;
}

export class SocketMessage {
	@IsNotEmpty()
	channel: string

	@IsNotEmpty()
	message: MessageDto;
}
