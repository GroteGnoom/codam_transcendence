import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import entities from './typeorm';
import { ChannelsModule } from './channels/channels.module';
import { AuthModule } from './auth/auth.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
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
				ssl: true,
				options: {"trustServerCertificate": true},
				extra: {
					ssl: {
						rejectUnauthorized: false,
					},
				},
				//options: {encrypt: false}
			}),
			inject: [ConfigService],
		}),
		AuthModule,
		UsersModule,
		ChannelsModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
