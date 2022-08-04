import { GlobalService } from './global.service';
import * as cookieParser from 'cookie-parser';
import { parse } from 'cookie';
import { Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';

const { exec } = require('child_process');

export function get_frontend_host() {
	var hostName: string;
	if (process.env.AMILOCAL ==="yes") {
		hostName = '127.0.0.1';
	} else {
		hostName = process.env.MYHOSTNAME;
	}
	return ('http://' + hostName + ":3000");
}

export function get_backend_host() {
	var hostName: string;
	if (process.env.AMILOCAL ==="yes") {
		hostName = '127.0.0.1';
	} else {
		hostName = process.env.MYHOSTNAME;
	}
	return ('http://' + hostName + ":5000");
}
export function getUserFromClient(client: Socket, configService: ConfigService) {
	const cookie = parse(String(client.handshake.headers.cookie))
	const name = 'transcendence'
	const secret = configService.get('SESSION_SECRET');
	const SID = cookieParser.signedCookie(cookie[name], secret)
	if (GlobalService.sessionId != SID) {
		console.log("session id's don't match, disconnecting");
		client.disconnect();
	}
	return GlobalService.users.get(SID as string)
}
