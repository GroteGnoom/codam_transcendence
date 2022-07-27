import { Module } from '@nestjs/common';
import { MatchGateway } from './match.gateway';

@Module({
  imports: [
    // TypeOrmModule.forFeature([Channel, Message]), 
    // UsersModule,
    // AuthModule
  ],
  controllers: [],
  providers: [MatchGateway]
})
export class MatchModule {}
