import { Body, Controller, Delete, Get, HttpStatus, NotFoundException, Param, Post, Put, Req, Res, UseGuards, UsePipes, ValidationPipe, ParseIntPipe } from '@nestjs/common';
import { SessionGuard } from 'src/auth/session.guard';
import { CreateChannelDto, JoinChannelDto } from 'src/channels/channels.dtos';
import { ChannelsService } from './channels.service';

@Controller('channels')
@UseGuards(SessionGuard)
export class ChannelsController {
    constructor(private readonly channelsService: ChannelsService) {}

    @Get()
    getChannels(@Req() req: any) {
        const userID = req.session.userId;
        if (userID)
            return this.channelsService.getChannels(userID);
        return []
    }

    @Get(':name')
    getChannel(@Param('name') name: string) {    
        return this.channelsService.getChannelByName(name);
    }

    @Get('chats/direct-messages')
    getChats(@Req() req: any) {
        const userID = req.session.userId;
        if (userID)
            return this.channelsService.getChats(userID);
        return []
    }

    @Post()
	@UsePipes(new ValidationPipe({stopAtFirstError: true}))   //validates body (not empty etc)
	createChannel(@Body() createChannelDto: CreateChannelDto, @Req() req: any) {
        const userID = req.session.userId;
		return this.channelsService.createChannel(createChannelDto, userID);
	}

    @Post('dm/:id')
    async createDirectMessage(@Req() req: any, @Param('id', ParseIntPipe) other: number) {
        const userID = req.session.userId;
        return this.channelsService.createDirectMessage(userID, other);
    }

    @Put('update/:name')
	@UsePipes(new ValidationPipe({stopAtFirstError: true}))
	updateChannel(@Body() createChannelDto: CreateChannelDto, @Req() req: any) {
        const userID = req.session.userId;
		return this.channelsService.updateChannel(createChannelDto, userID);
	}

    @Put(':name/admin/:id')
    async addAdminToChannel(@Res() res: any, @Param('name') name: string, @Param('id') newAdmin: number, @Req() req: any) {
        const userID = req.session.userId;
        const channel = await this.channelsService.addAdminToChannel(name, Number(newAdmin), Number(userID));
    }

    @Delete(':name/admin/:id')
    demoteAdmin(@Param('name') name: string, @Param('id', ParseIntPipe) admin: number, @Req() req: any) {
        const userID = req.session.userId;
        return this.channelsService.demoteAdmin(name, Number(admin), userID);
    }

    @Get(':name/messages')
	getMessages(@Param('name') channel: string) {
		return this.channelsService.getMessages(channel);
	}

    @Put(':name/member/:id')
    async addMemberToChannel(@Res() res: any, @Param('name') name: string, @Param('id', ParseIntPipe) newMember: number) {
        const channel = await this.channelsService.addMemberToChannel(name, Number(newMember));
        if (!channel) {
            throw new NotFoundException('Channel not found');
        } else {
            res.status(HttpStatus.OK).json(channel).send();
        }
    }

    @Get(':name/is-member')
    async checkIfMember(@Req() req: any, @Param('name') name: string) {
        const userID = req.session.userId;
        return this.channelsService.checkIfMember(name, userID);
    }

    @Put(':name/join')
    @UsePipes(new ValidationPipe({stopAtFirstError: true}))
    async joinChannel(@Req() req:any, @Param('name') name: string, @Body() joinChannelDto: JoinChannelDto) {
        const userID = req.session.userId;
        const password = joinChannelDto.password;
        return this.channelsService.joinChannel(name, userID, password);
    }

    @Delete(':name/member/self')
    removeSelfFromChannel(@Req() req: any, @Param('name') name: string) {
        const userID = req.session.userId;
        return this.channelsService.leaveFromChannel(name, userID);
    }

    @Delete(':name/member/:id')
    removeMemberFromChannel(@Req() req: any, @Param('name') name: string, @Param('id', ParseIntPipe) member: number) {
        const userID = req.session.userId;
        return this.channelsService.removeMemberFromChannel(name, Number(member), userID);
    }

    @Put(':name/mute/:id')
    async muteMember(@Req() req: any, @Param('name') name: string, @Param('id', ParseIntPipe) member: number) {
        const userID = req.session.userId;
        return this.channelsService.muteMemberInChannel(name, Number(member), userID);
    }

    @Get(':name/is-muted')
    async checkIfMuted(@Req() req: any, @Param('name') name: string) {
        const userID = req.session.userId;
        return this.channelsService.checkIfMuted(name, userID);
    }

    @Put(':name/ban/:id')
    async banMember(@Req() req: any, @Param('name') name: string, @Param('id', ParseIntPipe) member: number) {
        const userID = req.session.userId;
        return this.channelsService.banMemberFromChannel(name, Number(member), userID);
    }
}
