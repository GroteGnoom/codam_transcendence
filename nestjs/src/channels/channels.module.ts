import { Module } from '@nestjs/common';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Channel, Message } from "src/typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([Channel, Message]), ],
  controllers: [ChannelsController],
  providers: [ChannelsService]
})
export class ChannelsModule {}
