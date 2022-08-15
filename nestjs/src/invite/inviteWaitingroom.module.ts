import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/users.module';
import { MatchGateway } from 'src/match/match.gateway';
import { inviteWaitingRoomGateway } from './inviteWaitingroom.gateway';

@Module({
  imports: [
    // TypeOrmModule.forFeature([Channel, Message]), 
    UsersModule
    // AuthModule
  ],
  controllers: [],
  // providers: [ClassicWaitingRoomGateway]
})
export class inviteWaitingRoomModule {}