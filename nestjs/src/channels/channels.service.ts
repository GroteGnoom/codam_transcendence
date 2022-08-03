import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { ChannelMember } from 'src/typeorm/channel.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Channel, Message } from '../typeorm';
import { ChannelType, CreateChannelDto } from './channels.dtos';
import { ChannelsGateway } from './channels.gateway';
import { MessageDto } from './message.dtos';

@Injectable()
export class ChannelsService {
    constructor(
		@InjectRepository(Channel) private readonly channelRepository: Repository<Channel>,// templated with typeorm entity
        @InjectRepository(Message) private readonly messageRepository: Repository<Message>, 
        @InjectRepository(ChannelMember) private readonly memberRepository: Repository<ChannelMember>,         
        private readonly channelGateway: ChannelsGateway,
        private readonly userService: UsersService ) {
        // this.getChannels()
        // .then( (channels) => {
        //     console.log(`Found ${channels.length} channels on startup`)
        //     try{
        //         if (channels.length === 0) {
        //             userService.findOrCreateUser("root")
        //             .then( (user) => {
        //                 this.createChannel({ name: "General", channelType: ChannelType.Public }, user.id)
        //                 .then(() => this.createChannel({ name: "Secret", channelType: ChannelType.Protected, password: "secret" }, user.id) )
        //                 // this.createChannel({ name: "Secret", channelType: ChannelType.Protected, password: "secret" }, user.id)
        //             })
        //         }
        //     }
        //     catch(e){}
        // })
    }

    getChannels(){
        return this.channelRepository.find({
            where : [
                {channelType: ChannelType.Private},    // OR
                {channelType: ChannelType.Protected},  //https://orkhan.gitbook.io/typeorm/docs/find-options
                {channelType: ChannelType.Public}
            ]
        });
    };

    getChannelByName(name: string) {
        return this.channelRepository.findOne({
            where: {name: name},
            relations: ['members', 'admins']
        });
    }

    getChats() {
        return this.channelRepository.find({
            where: {channelType: ChannelType.dm},
            //relations: ['members', 'admins']
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
            members: [this.newMember(userID)],
            password: createChannelDto.password,
            channelType: createChannelDto.channelType,
        });
    }

    removeChannelByName(name: string) {
        this.memberRepository.delete({channel: {name: name}})   // first delete all channel member relations
        return this.channelRepository.delete({name: name});     // then delete channel
    }

    async addAdminToChannel(channelName: string, id: number, requester: number) {
        const channel: Channel = await this.channelRepository.findOne({
            where: {name: channelName},
            relations: ['admins']
        });
        if (!channel.admins.map((user) => user.id).includes(requester)) {
            throw new UnauthorizedException('You are not authorized');
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
        if (channel.members.map((member) => member.user.id).includes(id)) {
            return channel;
        }
        const members = [...channel.members, this.newMember(id)];
        return this.channelRepository.save({name: channelName, members: members});
    }

    async checkIfMember(channelName: string, id: number) {
        const channel: Channel = await this.channelRepository.findOne({
            where: {name: channelName},
            relations: ['members']
        });        
        return channel.members.map((member) => member.user.id).includes(id); // check if userId is in member array
    }

    async checkIfMuted(channelName: string, id: number) {
        const channel: Channel = await this.channelRepository.findOne({
            where: {name: channelName},
            relations: ['members']
        });
        return channel.members.find((member) => Number(member.user.id) === Number(id)).isMuted;
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
        const members = [...channel.members, this.newMember(id)];
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
        const members = channel.members.filter((member) => member.user.id != id)
        return this.channelRepository.save({name: channelName, members: members}); 
    }

    async muteMemberInChannel(channelName: string, id: number) {
        const channel: Channel = await this.channelRepository.findOne({
            where: {name: channelName},
            relations: ['members']
        });
        channel.members.forEach((member) => {
            if (member.user.id == id) {
                member.isMuted = true;
                member.mutedUntil = new Date(new Date().getTime() + 10 * 1000); // 10 seconds for testing
                this.channelGateway.broadcastMuteUser(channelName, id);
            } 
        })
        return this.channelRepository.save({name: channelName, members: channel.members}); 
    }

    @Interval(10000) // every 10 seconds
    async handleInterval(): Promise<void> {
        const currentDate: Date = new Date();

        const mutedMembers = await this.memberRepository.find({
            where: {isMuted: true},
            relations: ['channel']
        });
        mutedMembers.forEach((el) => {
            if (el.mutedUntil < currentDate) {
                el.isMuted = false;
                el.mutedUntil = null;
                this.memberRepository.save(el)
                this.channelGateway.broadcastUnmuteUser(el.channel.name, el.user.id);
            }
        })
      }

    async addMessage(channel: string, sender: number, message: MessageDto) {
        const newMessage: Message = this.messageRepository.create({sender: {id: sender}, text: message.text}); // will create id and date for message
        newMessage.channel = channel;
		await this.messageRepository.save(newMessage);
        return this.messageRepository.findOne({
            where: {id: newMessage.id},
        });
    }

    getMessages(channel: string) {
        return this.messageRepository.findBy({channel: channel});
    }

    createDirectMessage(user : number , other : number) {
        return this.channelRepository.save({ // create new Channel object (direct mesage)
            name: `dm-${user}-${other}`,
            owner: user,
            admins: [{id: user}, {id: other}],
            members: [this.newMember(user), this.newMember(other)],
            channelType: ChannelType.dm,
        });
    }

    private newMember(userId: number) {
        return {user: {id: userId}}
    }
}
