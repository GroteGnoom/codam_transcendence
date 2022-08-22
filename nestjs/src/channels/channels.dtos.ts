import { IsNotEmpty, IsOptional, MaxLength } from "class-validator";

export enum ChannelType {
	Private = "private",
	Public = "public",
	Protected = "protected",
	dm = "direct message",
}

export class CreateChannelDto {
	@IsNotEmpty()
	@MaxLength(20)
	name: string;

	@IsOptional()
	@MaxLength(20)
	password?: string;

	@IsNotEmpty()
	channelType: ChannelType;
}

export class JoinChannelDto {
	password?: string;
}
