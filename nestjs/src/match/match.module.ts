import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Match } from 'src/typeorm/match.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Match]), 
    // UsersModule,
    // AuthModule
  ],
  controllers: []
})
export class MatchModule {}
