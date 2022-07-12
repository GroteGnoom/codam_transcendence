import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { UsersService } from '../users/services/users/users.service';
import { UsersModule } from '../users/users.module';
import { FtStrategy } from './ft.strategy'

PassportModule.register({});

@Module({
  imports: [],
  providers: [AuthService, FtStrategy]
})
export class AuthModule {}
