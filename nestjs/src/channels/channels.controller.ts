import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { SessionGuard } from 'src/auth/session.guard';
import { CreateChannelDto, JoinChannelDto } from 'src/channels/channels.dtos';
import { ChannelsService } from './channels.service';

@Controller('channels')
@UseGuards(SessionGuard)
export class ChannelsController {
    constructor(private readonly channelsService: ChannelsService) {}

    @UseGuards(SessionGuard)
    @Get()
    getChannels(@Req() req: any) {
        const userID = req.session.userId;
        if (userID)
            return this.channelsService.getChannels(userID);
        return []
    }

    @UseGuards(SessionGuard)
    @Get(':name')
    getChannel(@Param('name') name: string) {    
        return this.channelsService.getChannelByName(name);
    }

    @UseGuards(SessionGuard)
    @Get('chats/direct-messages')
    getChats(@Req() req: any) {
        const userID = req.session.userId;
        if (userID)
            return this.channelsService.getChats(userID);
        return []
    }

    @UseGuards(SessionGuard)
    @Post()
	@UsePipes(new ValidationPipe({stopAtFirstError: true}))   //validates body (not empty etc)
	createChannel(@Body() createChannelDto: CreateChannelDto, @Req() req: any) {
        const userID = req.session.userId;
		return this.channelsService.createChannel(createChannelDto, userID);
	}

    @UseGuards(SessionGuard)
    @Post('dm/:id')
    createDirectMessage(@Req() req: any, @Param('id', ParseIntPipe) other: number) {
        const userID = req.session.userId;
        return this.channelsService.createDirectMessage(userID, other);
    }

    @UseGuards(SessionGuard)
    @Put('update/:name')
	@UsePipes(new ValidationPipe({stopAtFirstError: true}))
	updateChannel(@Body() createChannelDto: CreateChannelDto, @Req() req: any) {
        const userID = req.session.userId;
		return this.channelsService.updateChannel(createChannelDto, userID);
	}

    @UseGuards(SessionGuard)
    @Put(':name/admin/:id')
    addAdminToChannel(@Param('name') name: string, @Param('id') newAdmin: number, @Req() req: any) {
        const userID = req.session.userId;
        return this.channelsService.addAdminToChannel(name, Number(newAdmin), Number(userID));
    }

    @UseGuards(SessionGuard)
    @Delete(':name/admin/:id')
    demoteAdmin(@Param('name') name: string, @Param('id', ParseIntPipe) admin: number, @Req() req: any) {
        const userID = req.session.userId;
        return this.channelsService.demoteAdmin(name, Number(admin), userID);
    }

    @UseGuards(SessionGuard)
    @Get(':name/messages')
	getMessages(@Param('name') channel: string) {
		return this.channelsService.getMessages(channel);
	}

    @UseGuards(SessionGuard)
    @Put(':name/member/:id')
    addMemberToChannel(@Param('name') name: string, @Param('id', ParseIntPipe) newMember: number) {
        return this.channelsService.addMemberToChannel(name, Number(newMember));
    }

    @UseGuards(SessionGuard)
    @Get(':name/is-member')
    checkIfMember(@Req() req: any, @Param('name') name: string) {
        const userID = req.session.userId;
        return this.channelsService.checkIfMember(name, userID);
    }

    @UseGuards(SessionGuard)
    @Put(':name/join')
    @UsePipes(new ValidationPipe({stopAtFirstError: true}))
    joinChannel(@Req() req:any, @Param('name') name: string, @Body() joinChannelDto: JoinChannelDto) {
        const userID = req.session.userId;
        const password = joinChannelDto.password;
        return this.channelsService.joinChannel(name, userID, password);
    }

    @UseGuards(SessionGuard)
    @Delete(':name/member/self')
    removeSelfFromChannel(@Req() req: any, @Param('name') name: string) {
        const userID = req.session.userId;
        return this.channelsService.leaveFromChannel(name, userID);
    }

    @UseGuards(SessionGuard)
    @Delete(':name/member/:id')
    removeMemberFromChannel(@Req() req: any, @Param('name') name: string, @Param('id', ParseIntPipe) member: number) {
        const userID = req.session.userId;
        return this.channelsService.removeMemberFromChannel(name, Number(member), userID);
    }

    @UseGuards(SessionGuard)
    @Put(':name/mute/:id')
    async muteMember(@Req() req: any, @Param('name') name: string, @Param('id', ParseIntPipe) member: number) {
        const userID = req.session.userId;
        return this.channelsService.muteMemberInChannel(name, Number(member), userID);
    }

    @UseGuards(SessionGuard)
    @Get(':name/is-muted')
    async checkIfMuted(@Req() req: any, @Param('name') name: string) {
        const userID = req.session.userId;
        return this.channelsService.checkIfMuted(name, userID);
    }

    @UseGuards(SessionGuard)
    @Put(':name/ban/:id')
    async banMember(@Req() req: any, @Param('name') name: string, @Param('id', ParseIntPipe) member: number) {
        const userID = req.session.userId;
        return this.channelsService.banMemberFromChannel(name, Number(member), userID);
    }
}
