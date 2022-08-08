import {
  //HttpModule,
  Module,
} from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { FtStrategy } from './ft.strategy';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports    : [
    UsersModule,
    HttpModule,
  ],
  providers  : [
    FtStrategy,
  ],
  controllers: [
    AuthController,
  ],
})
export class AuthModule
{
}
