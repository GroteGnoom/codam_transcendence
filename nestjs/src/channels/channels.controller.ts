import { Body, Controller, Delete, Get, HttpStatus, NotFoundException, Param, Post, Put, Req, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateChannelDto, JoinChannelDto } from 'src/channels/channels.dtos';
import { ChannelsService } from './channels.service';

//@UseGuards(JwtAuthGuard)
@Controller('channels')
export class ChannelsController {
    constructor(private readonly channelsService: ChannelsService) {}

    @Get()
    getChannels() { 
        return this.channelsService.getChannels();
    }

    @Get(':name')
    getChannel(@Param('name') name: string) {       
        return this.channelsService.getChannelByName(name);
    }

    @Get('chats/direct-messages')
    getChats() { 
        return this.channelsService.getChats();
    }

    @Post()
	@UsePipes(ValidationPipe)   //validates body (not empty etc)
	createChannel(@Body() createChannelDto: CreateChannelDto, @Req() req: any) {
        const userID = req.session.userId;
        console.log("user id: ", userID);
		return this.channelsService.createChannel(createChannelDto, userID);
	}

    @Delete(':name')
    removeChannel(@Param('name') name: string) {        
        return this.channelsService.removeChannelByName(name);
    }

    @Put(':name/admin/:id')
    async addAdminToChannel(@Res() res, @Param('name') name: string, @Param('id') newAdmin: number, @Req() req: any) {
        const userID = req.session.userId;
        const channel = await this.channelsService.addAdminToChannel(name, Number(newAdmin), userID);
        if (!channel) {
            throw new NotFoundException('Channel not found');
        } else {
            res.status(HttpStatus.OK).json(channel).send();
        }
    }

    @Delete(':name/admin/:id')
    demoteAdmin(@Param('name') name: string, @Param('id') admin: number, @Req() req: any) {
        const userID = req.session.userId;
        return this.channelsService.demoteAdmin(name, Number(admin), userID);
    }

    @Get(':name/messages')
	getMessages(@Param('name') channel: string) {
		return this.channelsService.getMessages(channel);
	}

    @Put(':name/member/:id')
    async addMemberToChannel(@Res() res, @Param('name') name: string, @Param('id') newMember: number) {
        const channel = await this.channelsService.addMemberToChannel(name, Number(newMember));
        if (!channel) {
            throw new NotFoundException('Channel not found');
        } else {
            res.status(HttpStatus.OK).json(channel).send();
        }
    }

    @Get(':name/is-member')
    async checkIfMember(@Req() req, @Param('name') name: string) {
        const userID = req.session.userId;
        return this.channelsService.checkIfMember(name, userID);
    }

    @Put(':name/join')
    async joinChannel(@Req() req, @Param('name') name: string, @Body() joinChannelDto: JoinChannelDto) {
        const userID = req.session.userId;
        const password = joinChannelDto.password;
        return this.channelsService.joinChannel(name, userID, password);
    }

    @Delete(':name/member/:id')
    removeMemberFromChannel(@Param('name') name: string, @Param('id') member: number) {
        return this.channelsService.removeMemberFromChannel(name, Number(member));
    }

    @Put(':name/mute/:id')
    async muteMember(@Param('name') name: string, @Param('id') member: number) {
        return this.channelsService.muteMemberInChannel(name, Number(member));
    }

    @Get(':name/is-muted')
    async checkIfMuted(@Req() req, @Param('name') name: string) {
        const userID = req.session.userId;
        return this.channelsService.checkIfMuted(name, userID);
    }

    @Put(':name/ban/:id')
    async banMember(@Param('name') name: string, @Param('id') member: number) {
        return this.channelsService.banMemberFromChannel(name, Number(member));
    }

    @Post('dm/:id')
    async createDirectMessage(@Req() req, @Param('id') other: number) {
        const userID = req.session.userId;
        return this.channelsService.createDirectMessage(userID, other);
    }
}
