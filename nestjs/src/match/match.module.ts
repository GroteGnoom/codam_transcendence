import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassicWaitingRoomGateway } from 'src/classicWaitingroom/classicWaitingroom.gateway';
import { InviteWaitingRoomGateway } from 'src/inviteWaitingroom/inviteWaitingroom.gateway';
import { PinkPongWaitingRoomGateway } from 'src/PinkPongWaitingroom/PinkPongWaitingroom.gateway';
import { User } from 'src/typeorm';
import { GameStats } from 'src/typeorm/gameStats.entity';
import { Match } from 'src/typeorm/match.entity';
import { StatusGateway } from 'src/users/status.gateway';
import { UsersModule } from '../users/users.module';
import { MatchController } from './match.controller';
import { MatchGateway } from './match.gateway';
import { MatchService } from './match.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match, GameStats, User]), 
    UsersModule,
  ],
  controllers: [MatchController],
  providers: [MatchGateway, MatchService, ClassicWaitingRoomGateway, PinkPongWaitingRoomGateway, StatusGateway, InviteWaitingRoomGateway]
})
export class MatchModule {}
