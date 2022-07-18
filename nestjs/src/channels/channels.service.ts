import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel, Message } from '../typeorm';
import { CreateChannelDto } from './channels.dtos';
import { MessageDto } from './message.dtos';

@Injectable()
export class ChannelsService {
    constructor(
		@InjectRepository(Channel) private readonly channelRepository: Repository<Channel>,// templated with typeorm entity
        @InjectRepository(Message) private readonly messageRepository: Repository<Message>,
	) {}

    getChannels(){
        return this.channelRepository.find();
    };

    getChannelByName(name: string) {
        return this.channelRepository.findOneBy({name: name});
    }

    createChannel(createChannelDto: CreateChannelDto) {
        return this.channelRepository.save({ // create new Channel object
            name: createChannelDto.name,
            owner: createChannelDto.owner,
            admins: [createChannelDto.owner],
            members: [createChannelDto.owner]
        });
    }

    removeChannelByName(name: string) {
        return this.channelRepository.delete({name: name});
    }

    async addAdminToChannel(name: string, id: number) {
        const channel: Channel = await this.channelRepository.findOneBy({name: name});
        if (!channel) {
            return undefined;
        }
        if (channel.admins.includes(id)) {
            return channel;
        }
        const admins = [...channel.admins, id];
        return this.channelRepository.update(name, {admins: admins});
    }

    async demoteAdmin(name: string, id: number) {
        const channel: Channel = await this.channelRepository.findOneBy({name: name});
        if (!channel) {
            return undefined;
        }
        if (id == channel.owner) {
            throw new BadRequestException('Cannot remove owner from administators');
        }
        const admins = channel.admins.filter(_id => _id != id)
        return this.channelRepository.update(name, {admins: admins});  
    }

    async addMemberToChannel(name: string, id: number) {
        const channel: Channel = await this.channelRepository.findOneBy({name: name});
        if (!channel) {
            return undefined;
        }
        if (channel.members.includes(id)) {
            return channel;
        }
        const members = [...channel.members, id];
        return this.channelRepository.update(name, {members: members});
    }

    async removeMemberFromChannel(name: string, id: number) {
        const channel: Channel = await this.channelRepository.findOneBy({name: name});
        if (!channel) {
            return undefined;
        }
        if (id == channel.owner) {
            throw new BadRequestException('Cannot remove owner from members');
        }
        const members = channel.members.filter(_id => _id != id)
        return this.channelRepository.update(name, {members: members});  
    }

    addMessage(channel: string, message: MessageDto) {
        const newMessage: Message = this.messageRepository.create(message); // will create id and date for message
        newMessage.channel = channel;
		return this.messageRepository.save(newMessage);        
    }

    getMessages(channel: string) {
        return this.messageRepository.findBy({channel: channel});
    }
}
