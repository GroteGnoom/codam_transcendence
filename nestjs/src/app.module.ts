import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TwoFactorAuthenticationModule } from './auth/twoFactorAuthentication.module';
import { ChannelsModule } from './channels/channels.module';
import { ClassicWaitingRoomModule } from './classicWaitingroom/classicWaitingroom.module';
import { inviteWaitingRoomModule } from './inviteWaitingroom/inviteWaitingroom.module';
import { MatchModule } from './match/match.module';
import { PinkPongWaitingRoomModule } from './PinkPongWaitingroom/PinkPongWaitingroom.module';
import entities from './typeorm';
import { UsersModule } from './users/users.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		ScheduleModule.forRoot(),
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				host: configService.get('DB_HOST'),
				port: +configService.get<number>('DB_PORT'),
				username: configService.get('DB_USERNAME'),
				password: configService.get('DB_PASSWORD'),
				database: configService.get('DB_NAME'),
				entities: entities,
				synchronize: true,
				ssl: false,
				autoLoadEntities: true
				// options: {"trustServerCertificate": true},
				// extra: {
				// 	ssl: {
				// 		rejectUnauthorized: false,
				// 	},
				// },
				//options: {encrypt: false}
			}),
			inject: [ConfigService],
		}),
		AuthModule,
		TwoFactorAuthenticationModule,
		UsersModule,
		MatchModule,
		ChannelsModule,
		ClassicWaitingRoomModule,
		PinkPongWaitingRoomModule,
		inviteWaitingRoomModule,
	],
	controllers: [],
	providers: [AppService],
})
export class AppModule {}
