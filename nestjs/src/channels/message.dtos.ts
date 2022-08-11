import { IsNotEmpty } from "class-validator";

export class MessageDto {
	@IsNotEmpty()
	text: string;

	invite: boolean;
}

export class SocketMessage {
	@IsNotEmpty()
	channel: string

	@IsNotEmpty()
	message: MessageDto;
}
