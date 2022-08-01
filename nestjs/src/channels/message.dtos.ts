import { IsNotEmpty } from "class-validator";

export class MessageDto {
	@IsNotEmpty()
	text: string;
}

export class SocketMessage {
	@IsNotEmpty()
	channel: string

	@IsNotEmpty()
	message: MessageDto;
}
