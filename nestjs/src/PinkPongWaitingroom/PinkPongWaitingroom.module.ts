import { Module } from '@nestjs/common';
import { MatchGateway } from 'src/match/match.gateway';
import { PinkPongWaitingRoomGateway } from './PinkPongWaitingroom.gateway';

@Module({
  imports: [
    // TypeOrmModule.forFeature([Channel, Message]), 
    // UsersModule,
    // AuthModule
  ],
  controllers: [],
  providers: [PinkPongWaitingRoomGateway]
})
export class PinkPongWaitingRoomModule {}