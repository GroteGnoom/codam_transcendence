import { IsNotEmpty, MaxLength } from "class-validator";

export enum ChannelType {
	Private = "private",
	Public = "public",
	Protected = "protected",
	dm = "direct message",
}

export class CreateChannelDto {
	@IsNotEmpty()
	@MaxLength(10)
	name: string;

	password?: string;

	@IsNotEmpty()
	channelType: ChannelType;
}

export class JoinChannelDto {
	password?: string;
}
