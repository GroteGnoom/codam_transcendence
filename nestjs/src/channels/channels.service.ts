import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Channel, Message } from '../typeorm';
import { ChannelType, CreateChannelDto } from './channels.dtos';
import { MessageDto } from './message.dtos';

@Injectable()
export class ChannelsService {
    constructor(
		@InjectRepository(Channel) private readonly channelRepository: Repository<Channel>,// templated with typeorm entity
        @InjectRepository(Message) private readonly messageRepository: Repository<Message>, 
        private readonly userService: UsersService ) {
        this.getChannels()
        .then( (channels) => {
            console.log(`Found ${channels.length} channels on startup`)
            if (channels.length === 0) {
                userService.findOrCreateUser("root")
                .then( (user) => {
                    this.createChannel({ name: "General", channelType: ChannelType.Public }, user.id)
                    .then(() => this.createChannel({ name: "Secret", channelType: ChannelType.Protected, password: "secret" }, user.id) )
                    // this.createChannel({ name: "Secret", channelType: ChannelType.Protected, password: "secret" }, user.id)
                })
            }
        })
    }

    getChannels(){
        return this.channelRepository.find();
    };

    getChannelByName(name: string) {
        return this.channelRepository.findOne({
            where: {name: name},
            relations: ['members', 'admins']
        });
    }

    createChannel(createChannelDto: CreateChannelDto, userID: number) {
        if (createChannelDto.channelType == ChannelType.Protected &&
                !createChannelDto.password) {
            throw new BadRequestException('Must provide a password for a protected channel');
        }

        return this.channelRepository.save({ // create new Channel object
            name: createChannelDto.name,
            owner: userID,
            admins: [{id: userID}],
            members: [{id: userID}],
            password: createChannelDto.password,
            channelType: createChannelDto.channelType,
        });
    }

    removeChannelByName(name: string) {
        return this.channelRepository.delete({name: name});
    }

    async addAdminToChannel(channelName: string, id: number) {
        const channel: Channel = await this.channelRepository.findOne({
            where: {name: channelName},
            relations: ['admins']
        });
        if (!channel) {
            return undefined;
        }
        if (channel.admins.map((user) => user.id).includes(id)) {
            return channel;
        }
        const admins = [...channel.admins, {id: id}];
        return this.channelRepository.save({name: channelName, admins: admins});
    }

    async demoteAdmin(channelName: string, id: number) {
        const channel: Channel = await this.channelRepository.findOne({
            where: {name: channelName},
            relations: ['admins']
        });
        if (!channel) {
            return undefined;
        }
        if (id == channel.owner) {
            throw new BadRequestException('Cannot remove owner from administators');
        }
        const admins = channel.admins.filter((user) => user.id != id)
        return this.channelRepository.save({name: channelName, admins: admins}); 
    }

    async addMemberToChannel(channelName: string, id: number) {
        const channel: Channel = await this.channelRepository.findOne({
            where: {name: channelName},
            relations: ['members']
        });
        if (!channel) {
            return undefined;
        }
        if (channel.members.map((user) => user.id).includes(id)) {
            return channel;
        }
        const members = [...channel.members, {id: id}];
        return this.channelRepository.save({name: channelName, members: members});
    }

    async checkIfMember(channelName: string, id: number) {
        const channel: Channel = await this.channelRepository.findOne({
            where: {name: channelName},
            relations: ['members']
        });
        return channel.members.map((user) => user.id).includes(id); // check if userId is in member array
    }

    async joinChannel(channelName: string, id: number, password?: string) {
        const channel: Channel = await this.channelRepository.findOne({
            where: {name: channelName},
            relations: ['members']
        });
        if (channel.channelType === ChannelType.Protected) {
            // TODO check password hash with backend value instead of string compare
            if (password !== channel.password) {
                throw new BadRequestException("Password is not correct")
            }
        }
        const members = [...channel.members, {id: id}];
        return this.channelRepository.save({name: channelName, members: members});
    }

    async removeMemberFromChannel(channelName: string, id: number) {
        const channel: Channel = await this.channelRepository.findOne({
            where: {name: channelName},
            relations: ['members']
        });
        if (!channel) {
            return undefined;
        }
        if (id == channel.owner) {
            throw new BadRequestException('Cannot remove owner from members');
        }
        const members = channel.members.filter((user) => user.id != id)
        return this.channelRepository.save({name: channelName, members: members}); 
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
