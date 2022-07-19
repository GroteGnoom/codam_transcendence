import {
  //HttpModule,
  Module,
} from '@nestjs/common';
import { AuthService } from './auth.service';
//import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { FtStrategy } from './ft.strategy';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports    : [
    //UsersModule,
    HttpModule,
	JwtModule.registerAsync({
		imports: [ConfigModule],
		useFactory: async (configService: ConfigService) => ({
			secret: configService.get('JWT_SECRET'),
			signOptions: { expiresIn: '60s' },
		}),
		inject: [ConfigService],
	}),
  ],
  providers  : [
    AuthService,
    FtStrategy,
	JwtStrategy,
  ],
  controllers: [
    AuthController,
  ],
})
export class AuthModule
{
}
