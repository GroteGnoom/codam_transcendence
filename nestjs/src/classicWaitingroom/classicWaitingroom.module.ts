import { Module } from '@nestjs/common';
import { MatchGateway } from 'src/match/match.gateway';
import { ClassicWaitingRoomGateway } from './classicWaitingroom.gateway';

@Module({
  imports: [
    // TypeOrmModule.forFeature([Channel, Message]), 
    // UsersModule,
    // AuthModule
  ],
  controllers: [],
  providers: [ClassicWaitingRoomGateway]
})
export class ClassicWaitingRoomModule {}