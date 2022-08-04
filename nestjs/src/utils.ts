import { GlobalService } from './global.service';
import * as cookieParser from 'cookie-parser';
import { parse } from 'cookie';
import { Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';

const { exec } = require('child_process');

export function get_frontend_host() {
	//const hostName = os.hostname();
	
	var hostName: string = '127.0.0.1';
	/*
	exec('hostname', (error, stdout, stderr) => {
		console.log('error: ', error);
		console.log('stderr: ', stderr);
		console.log('stdout: ', stdout);
		hostName = stdout.toString();
	});
   */
	return ('http://' + hostName + ":3000");
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
