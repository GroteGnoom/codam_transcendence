import {
  //HttpModule,
  Module,
} from '@nestjs/common';
import { TwoFactorAuthenticationService } from './twoFactorAuthentication.service';
//import { UsersModule } from '../users/users.module';
import { TwoFactorAuthenticationController } from './twoFactorAuthentication.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';

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
