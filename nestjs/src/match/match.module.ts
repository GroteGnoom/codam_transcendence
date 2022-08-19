import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from 'src/typeorm/match.entity';
import { ClassicWaitingRoomGateway } from 'src/classicWaitingroom/classicWaitingroom.gateway';
import { MatchGateway } from './match.gateway';
import { PinkPongWaitingRoomGateway } from 'src/PinkPongWaitingroom/PinkPongWaitingroom.gateway';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';
import { GameStats } from 'src/typeorm/gameStats.entity';
import { UsersModule} from '../users/users.module';
import { User } from 'src/typeorm';
import { StatusGateway } from 'src/users/status.gateway';
import { InviteWaitingRoomGateway } from 'src/inviteWaitingroom/inviteWaitingroom.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match, GameStats, User]), 
    UsersModule,
  ],
  controllers: [MatchController],
  providers: [MatchGateway, MatchService, ClassicWaitingRoomGateway, PinkPongWaitingRoomGateway, StatusGateway, InviteWaitingRoomGateway]
})
export class MatchModule {}
