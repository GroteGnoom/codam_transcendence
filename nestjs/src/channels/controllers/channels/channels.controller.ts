import {    Body, Controller, Get, Post, Delete, Put, Param,
            Res, UsePipes, HttpStatus, ValidationPipe,
} from '@nestjs/common';
import { CreateChannelDto } from 'src/channels/dto/channels.dtos';
import { MessageDto } from '../../dto/message.dtos';
import { ChannelsService } from '../../services/channels/channels.service';

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

    @Post()
	@UsePipes(ValidationPipe)
	createChannel(@Body() createChannelDto: CreateChannelDto) {
		return this.channelsService.createChannel(createChannelDto);
	}

    @Delete(':name')
    removeChannel(@Param('name') name: string) {        
        return this.channelsService.removeChannelByName(name);
    }

    @Put(':name/admins/:id')
    async addAdminToChannel(@Res() res, @Param('name') name: string, @Param('id') newAdmin: number) {
        const channel = await this.channelsService.addAdminToChannel(name, Number(newAdmin));
        if (!channel) {
            res.status(HttpStatus.NOT_FOUND).send();
        } else {
            res.status(HttpStatus.OK).json(channel).send();
        }
    }

    @Delete(':name/admins/:id')
    removeAdminFromChannel(@Param('name') name: string, @Param('id') admin: number) {
        return this.channelsService.removeAdminFromChannel(name, Number(admin));
    }

    @Post(':name/messages')
    @UsePipes(ValidationPipe)
	postMessage(@Param('name') channel: string, @Body() message: MessageDto) {
		return this.channelsService.addMessage(channel, message);
	}

    @Get(':name/messages')
	getMessages(@Param('name') channel: string) {
		return this.channelsService.getMessages(channel);
	}
}
