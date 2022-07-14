import { Module } from '@nestjs/common';
import { ChannelsController } from './controllers/channels/channels.controller';
import { ChannelsService } from './services/channels/channels.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel, Message } from "src/typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([Channel, Message]), ],
  controllers: [ChannelsController],
  providers: [ChannelsService]
})
export class ChannelsModule {}
