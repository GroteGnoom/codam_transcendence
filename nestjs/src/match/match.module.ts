import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from 'src/typeorm/match.entity';
import { ClassicWaitingRoomGateway } from 'src/classicWaitingroom/classicWaitingroom.gateway';
import { MatchGateway } from './match.gateway';
import { PinkPongWaitingRoomGateway } from 'src/PinkPongWaitingroom/PinkPongWaitingroom.gateway';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match]), 
    // UsersModule,
    // AuthModule
  ],
  controllers: [MatchController],
  providers: [MatchGateway, MatchService, ClassicWaitingRoomGateway, PinkPongWaitingRoomGateway]
})
export class MatchModule {}
