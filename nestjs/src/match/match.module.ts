import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from 'src/typeorm/match.entity';
import { WaitingRoomGateway } from 'src/waitingroom/waitingroom.gateway';
import { MatchGateway } from './match.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match]), 
    // UsersModule,
    // AuthModule
  ],
  controllers: [],
  providers: [MatchGateway, WaitingRoomGateway]
})
export class MatchModule {}
