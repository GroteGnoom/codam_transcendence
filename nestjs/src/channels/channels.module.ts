import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Channel, Message } from "src/typeorm";
import { ChannelMember } from 'src/typeorm/channel.entity';
import { UsersModule } from 'src/users/users.module';
import { ChannelsController } from './channels.controller';
import { ChannelsGateway } from './channels.gateway';
import { ChannelsService } from './channels.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Channel, ChannelMember, Message]), 
    UsersModule,
    AuthModule,
  ],
  controllers: [ChannelsController],
  providers: [ChannelsService, ChannelsGateway]
})
export class ChannelsModule {}
