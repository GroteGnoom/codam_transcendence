import { Module } from '@nestjs/common';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { ChannelsGateway} from './channels.gateway'
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel, Message } from "src/typeorm";
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel, Message]), 
    UsersModule  
  ],
  controllers: [ChannelsController],
  providers: [ChannelsService, ChannelsGateway]
})
export class ChannelsModule {}
