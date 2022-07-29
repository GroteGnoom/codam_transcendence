import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
  } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Session } from '@nestjs/common';
import { parse } from 'cookie'
import * as cookieParser from 'cookie-parser'
import { GlobalService } from '../global.service';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: 'http://127.0.0.1:3000',
    credentials: true
  },
})
export class WaitingRoom {
  constructor (
  private readonly configService: ConfigService
	) {}

  logins: number = 0;

  @WebSocketServer()
  server: Server;

	handleConnection(client: Socket, @Session() session) {
    console.log("started waitingroom server");
		const cookie = parse(String(client.handshake.headers.cookie))
		const name = 'transcendence'
		const secret = this.configService.get('SESSION_SECRET');
		const SID = cookieParser.signedCookie(cookie[name], secret)
		if (GlobalService.sessionId != SID) {
            console.log("session id's don't match, disconnecting");
			client.disconnect();
		}
	}

  afterInit(server: Server) {
  console.log('Init');
	}

  @SubscribeMessage('loggedIn')
  async handleSendMessage(client: Socket, payload: any): Promise<void> {
      this.checkWaitingRoom();
  }

  checkWaitingRoom() {
    this.logins = this.logins + 1;
    console.log(this.logins);
    if (this.logins === 2) {
        console.log("2 players");
        this.server.emit("found2Players", {
          "Player1": "IDPlayer1",
          "Player2": "IDPlayer2"
      });
    }
  }
}