import {
  Module
} from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { TwoFactorAuthenticationController } from './twoFactorAuthentication.controller';
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';

@Module({
  imports    : [
	  UsersModule,
  ],
  providers  : [
    TwoFactorAuthenticationService,
  ],
  controllers: [
    TwoFactorAuthenticationController,
  ],
})
export class TwoFactorAuthenticationModule
{
}
