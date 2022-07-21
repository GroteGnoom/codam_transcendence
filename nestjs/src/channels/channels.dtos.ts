import { IsNotEmpty } from "class-validator";

export enum ChannelType {
	Private = "private",
	Public = "public",
	Protected = "protected",
}

export class CreateChannelDto {
	@IsNotEmpty()
	name: string;

	@IsNotEmpty()
	owner: number;

	password?: string;

	@IsNotEmpty()
	channelType: ChannelType;
}
