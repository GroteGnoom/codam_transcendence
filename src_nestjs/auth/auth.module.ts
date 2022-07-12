import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { UsersService } from '../users/services/users/users.service';
import { UsersModule } from '../users/users.module';

PassportModule.register({});

@Module({
  imports: [],
  providers: [AuthService]
})
export class AuthModule {}
