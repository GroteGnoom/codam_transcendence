import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
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
        private readonly userService: UsersService ) {}

    getChannels(userID: number){
        return this.channelRepository.find({
            where : [
                {channelType: ChannelType.Private, members: [{user: {id: userID}}]},    // OR
                {channelType: ChannelType.Protected},  //https://orkhan.gitbook.io/typeorm/docs/find-options
                {channelType: ChannelType.Public}
            ],
            order: {
                name: "ASC" // "DESC"
            }
        });
    };

    async getChannelByName(name: string) {
        const channel = await this.channelRepository.findOne({
            where: {name: name},
            relations: ['members', 'admins']
        });
        if (!channel) {
            throw new NotFoundException('Channel not found');
        }
        channel.password = undefined;
        return channel;
    }

    getChats(userID: number) { //gets direct messages
        return this.channelRepository.find({
            where: {channelType: ChannelType.dm, admins: [{id: userID}]},
            relations: ['members', 'admins']
        });
    }

    async createChannel(createChannelDto: CreateChannelDto, userID: number) {
        if (await this.channelRepository.findOne({where: {name: createChannelDto.name}})){
            throw new BadRequestException(`ChannelName ${createChannelDto.name} already exist.`);
        }

        if (createChannelDto.channelType === ChannelType.Protected &&
                !createChannelDto.password) {
            throw new BadRequestException('Must provide a password for a protected channel');
        }
        // https://wanago.io/2020/05/25/api-nestjs-authenticating-users-bcrypt-passport-jwt-cookies/
        // When we use bcrypt, we define salt rounds. It boils down to being a cost factor and controls the time needed to receive a result. 
        // Increasing it by one doubles the time. The bigger the cost factor, the more difficult it is to reverse the hash with brute-forcing. 
        // Generally speaking, 10 salt rounds should be fine.
        const hash = await bcrypt.hash(createChannelDto.password, 10);  //ten salt
        const newChannel = await this.channelRepository.save({ // create new Channel object
            name: createChannelDto.name,
            owner: userID,
            admins: [{id: userID}],
            members: [this.newMember(userID)],
            password: hash,
            channelType: createChannelDto.channelType,
        }).catch( (e) => {
			throw new BadRequestException('could not create channel');
		});
        this.channelGateway.broadcastNewChannel(newChannel.name)
        return newChannel;
    }

    async createDirectMessage(user : number , other : number) {
        if ( !(await this.userService.findUsersById(other)) ) {
            throw new BadRequestException('Bad Request: user does not exist');
        }
		console.log('createDirectmessage');
        const newDM = await this.channelRepository.save({ // create new Channel object (direct mesage)
            name: `dm-${user}-${other}`,
            owner: user,
            admins: [{id: user}, {id: other}],
            members: [this.newMember(user), this.newMember(other)],
            channelType: ChannelType.dm,
        }).catch( (e) => {
			throw new BadRequestException('could not create channel');
		});
        this.channelGateway.broadcastNewDM(newDM.name)
        return newDM;
    }

    async updateChannel(createChannelDto: CreateChannelDto, requester: number) {
        if (createChannelDto.channelType == ChannelType.Protected &&
                !createChannelDto.password) {
            throw new BadRequestException('Must provide a password for a protected channel');
        }
        const channel: Channel = await this.channelRepository.findOne({
            where: {name: createChannelDto.name},
            relations: ['admins']
        });
        if (! channel ) {
            throw new NotFoundException('Channel not Found');
        }
        if (!channel.admins.map((user) => user.id).includes(requester)) {
            throw new UnauthorizedException('You are not authorized');
        }

        let hash = undefined;       //in case no password, can be undefined
        if (createChannelDto.password){
            hash = await bcrypt.hash(createChannelDto.password, 10);
        }
        return this.channelRepository.save({
            name: createChannelDto.name,
            password: hash,
            channelType: createChannelDto.channelType,
        }).catch( (e) => {
			throw new BadRequestException('could not update channel');
		});
    }

    // removeChannelByName(name: string) {
    //     this.memberRepository.delete({channel: {name: name}})   // first delete all channel member relations
    //     return this.channelRepository.delete({name: name});     // then delete channel
    // }

    async addAdminToChannel(channelName: string, newAdmin: number, requester: number) {
        const channel: Channel = await this.channelRepository.findOne({
            where: {name: channelName},
            relations: ['admins']
        });
        if (!channel) {
            throw new NotFoundException('Channel not found');
        }
        if ( !(await this.userService.findUsersById(newAdmin)) ) {
            throw new BadRequestException('Bad Request: user does not exist');
        }
        if (!channel.admins.map((user) => Number(user.id)).includes(requester)) {
            throw new UnauthorizedException('You are not authorized');
        }
        if (channel.admins.map((user) => Number(user.id)).includes(newAdmin)) {
            throw new BadRequestException('User is already admin');
        }
        const admins = [...channel.admins, {id: newAdmin}];
        return this.channelRepository.save({name: channelName, admins: admins
        }).catch( (e) => {
			throw new BadRequestException('could not add admin');
		});
    }

    async demoteAdmin(channelName: string, id: number, requester: number) {
        const channel: Channel = await this.channelRepository.findOne({
            where: {name: channelName},
            relations: ['admins']
        });
        if (!channel) {
            throw new NotFoundException('Channel not found');
        }
        if (!channel.admins.map((user) => user.id).includes(requester)) {
            throw new UnauthorizedException('You are not authorized');
        }
        if (id == channel.owner) {
            throw new BadRequestException('Cannot remove owner from administators');
        }
        const admins = channel.admins.filter((user) => user.id != id)
        return this.channelRepository.save({name: channelName, admins: admins
        }).catch( (e) => {
			throw new BadRequestException('could not demote admin');
		});
    }

    async addMemberToChannel(channelName: string, newMember: number) {
        const channel: Channel = await this.channelRepository.findOne({
            where: {name: channelName},
            relations: ['members']
        });
        if (!channel) {
            throw new NotFoundException('Channel not found');
        }
        if ( !(await this.userService.findUsersById(newMember)) ) {
            throw new BadRequestException('Bad Request: user does not exist');
        }
        if (channel.bannedUsers.includes(newMember)) {
            throw new BadRequestException("This member is banned")
        }
        if (channel.members.map((member) => member.user.id).includes(newMember)) {
            return channel;
        }
        const members = [...channel.members, this.newMember(newMember)];
        return this.channelRepository.save({name: channelName, members: members
        }).catch( (e) => {
			throw new BadRequestException('could not add member');
		});
    }

    async checkIfMember(channelName: string, id: number) {
        const channel: Channel = await this.channelRepository.findOne({
            where: {name: channelName},
            relations: ['members']
        });
        if (!channel) {
            throw new NotFoundException('Channel not found');
        }     
        return channel.members.map((member) => member.user.id).includes(id); // check if userId is in member array
    }

    async checkIfMuted(channelName: string, id: number) {
        const channel: Channel = await this.channelRepository.findOne({
            where: {name: channelName},
            relations: ['members']
        });
        if (!channel) {
            throw new NotFoundException('Channel not found');
        }
        return channel.members.find((member) => Number(member.user.id) === Number(id)).isMuted;
    }

    async joinChannel(channelName: string, id: number, password?: string) {
        const channel: Channel = await this.channelRepository.findOne({
            where: {name: channelName},
            relations: ['members']
        });
        if (!channel) {
            throw new NotFoundException('Channel not found');
        }
        if (channel.bannedUsers.includes(Number(id))) {
                throw new BadRequestException("You are banned from this channel")
        }
        if (channel.channelType === ChannelType.Protected) {
            const isPasswordMatching = await bcrypt.compare(password, channel.password);
            if (!isPasswordMatching) {
                throw new BadRequestException("Password is not correct")
            }
        }
        const members = [...channel.members, this.newMember(id)];
        return this.channelRepository.save({name: channelName, members: members
        }).catch( (e) => {
			throw new BadRequestException('could not join channel');
		});
    }

    async removeMemberFromChannel(channelName: string, id: number, requester: number) {
        const channel: Channel = await this.channelRepository.findOne({
            where: {name: channelName},
            relations: ['members', 'admins']
        });
        if (!channel) {
            throw new NotFoundException('Channel not found');
        }
        if ( !(await this.userService.findUsersById(id)) ) {
            throw new BadRequestException('Bad Request: user does not exist');
        }
        if (!channel.admins.map((user) => user.id).includes(requester)) {
            throw new UnauthorizedException('You are not authorized');  
        }
        if (id == channel.owner) {
            throw new BadRequestException('Cannot remove owner from members');
        }
        const members = channel.members.filter((member) => member.user.id != id)
        const admins = channel.admins.filter((admin) => admin.id != id)
        return this.channelRepository.save({name: channelName, members: members, admins: admins
        }).catch( (e) => {
			throw new BadRequestException('could not remove member from channel');
		});
    }

    async leaveFromChannel(channelName: string, id: number) {
        const channel: Channel = await this.channelRepository.findOne({
            where: {name: channelName},
            relations: ['members', 'admins']
        });
        if (!channel) {
            throw new NotFoundException('Channel not found');
        }
        if (id == channel.owner) {
            const nextOwner = channel.admins.find((admin) => admin.id != id)
            if (!nextOwner) {
                throw new BadRequestException('Promote someone else to admin before leaving this channel');
            }
            channel.owner = nextOwner.id        
        }
        channel.members = channel.members.filter((member) => member.user.id != id)
        channel.admins = channel.admins.filter((admin) => admin.id != id)
        return this.channelRepository.save(channel).catch( (e) => {
			throw new BadRequestException('could not leave from channel');
		});
    }

    async muteMemberInChannel(channelName: string, id: number, requester: number) {
        const channel: Channel = await this.channelRepository.findOne({
            where: {name: channelName},
            relations: ['members', 'admins']
        });
        if (!channel) {
            throw new NotFoundException('Channel not found');
        }
        if ( !(await this.userService.findUsersById(id)) ) {
            throw new BadRequestException('Bad Request: user does not exist');
        }
        if (!channel.admins.map((user) => user.id).includes(requester)) {
            throw new UnauthorizedException('You are not authorized');
        }
        channel.members.forEach((member) => {
            if (member.user.id == id) {
                member.isMuted = true;
                member.mutedUntil = new Date(new Date().getTime() + 30 * 1000); // 30 seconds for testing
                this.channelGateway.broadcastMuteUser(channelName, id);
            } 
        })
        return this.channelRepository.save({name: channelName, members: channel.members}).catch( (e) => {
			throw new BadRequestException('could not mute member in channel');
		}); 
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
                this.memberRepository.save(el).catch( (e) => {
			throw new BadRequestException('could not mute member in channel');
		})
                this.channelGateway.broadcastUnmuteUser(el.channel.name, el.user.id);
            }
        })
      }

    async banMemberFromChannel(channelName: string, id: number, requester: number) {
        await this.removeMemberFromChannel(channelName, id, requester);
        const channel: Channel = await this.channelRepository.findOne({
            where: {name: channelName },
            relations: ['admins']
        });
        if (!channel) {
            throw new NotFoundException('Channel not found');
        }
        if ( !(await this.userService.findUsersById(id)) ) {
            throw new BadRequestException('Bad Request: user does not exist');
        }
        channel.bannedUsers.push(Number(id));
        return this.channelRepository.save(channel).catch( (e) => {
			throw new BadRequestException('could not ban member from channel');
		})
; 
    }

    async addMessage(channel: string, sender: number, message: MessageDto) {
        const newMessage: Message = this.messageRepository.create({
            sender: {id: sender},
            text: message.text,
            invite: message.invite
        }); // will create id and date for message
        const channelExist: Channel = await this.channelRepository.findOne({
            where: {name: channel }
        });
        if (!channelExist) {
            throw new NotFoundException('Channel not found');
        }
        newMessage.channel = channel;
		await this.messageRepository.save(newMessage).catch( (e) => {
			throw new BadRequestException('could not add message channel');
		})
;
        return this.messageRepository.findOne({
            where: {id: newMessage.id},
        });
    }

    getMessages(channel: string) {
        return this.messageRepository.find({
            where : {channel: channel},
            order: { date: "ASC" } // "DESC"
        });
    }

    private newMember(userId: number) {
        return {user: {id: userId}}
    }
}
