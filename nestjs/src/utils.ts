import { ConfigService } from '@nestjs/config';
import { parse } from 'cookie';
import * as cookieParser from 'cookie-parser';
import { Socket } from 'socket.io';
import { GlobalService } from './global.service';

const { exec } = require('child_process');

export function get_frontend_host() {
	var hostName: string;
	if (process.env.SERVER_LOCATION ==="local") {
		hostName = '127.0.0.1';
	} else {
		hostName = process.env.MYHOSTNAME;
	}
	return ('http://' + hostName + ":3000");
}

export function get_backend_host() {
	var hostName: string;
	if (process.env.SERVER_LOCATION ==="local") {
		hostName = '127.0.0.1';
	} else {
		hostName = process.env.MYHOSTNAME;
	}
	return ('http://' + hostName + ":5000");
}

export function getUserFromClient(client: Socket, configService: ConfigService) {
	let userID: number;

	const cookie = parse(String(client.handshake.headers.cookie))
	const name = 'transcendence'
	const secret = configService.get('SESSION_SECRET');
	const SID = cookieParser.signedCookie(cookie[name], secret)
	userID = GlobalService.users.get(SID as string)
	if (GlobalService.users.get(SID as string) != userID) {
		client.disconnect();
	}
	return userID
}
