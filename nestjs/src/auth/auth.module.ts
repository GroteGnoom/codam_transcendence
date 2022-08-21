import { HttpModule } from '@nestjs/axios';
import {
  Module
} from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { FtStrategy } from './ft.strategy';

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
