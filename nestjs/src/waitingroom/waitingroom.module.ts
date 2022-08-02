import { Module } from '@nestjs/common';
import { MatchGateway } from 'src/match/match.gateway';
import { WaitingRoomGateway } from './waitingroom.gateway';

@Module({
  imports: [
    // TypeOrmModule.forFeature([Channel, Message]), 
    // UsersModule,
    // AuthModule
  ],
  controllers: [],
  providers: [WaitingRoomGateway]
})
export class WaitingRoomModule {}