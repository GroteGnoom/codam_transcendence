import { Module } from '@nestjs/common';
import { WaitingRoom } from './waitingroom.gateway';

@Module({
  imports: [
    // TypeOrmModule.forFeature([Channel, Message]), 
    // UsersModule,
    // AuthModule
  ],
  controllers: [],
  providers: [WaitingRoom]
})
export class WaitingRoomModule {}