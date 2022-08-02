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
import { MatchGateway } from 'src/match/match.gateway';

@WebSocketGateway({
  cors: {
    origin: 'http://127.0.0.1:3000',
    credentials: true
  },
})
export class WaitingRoomGateway {
  constructor (
  private readonly configService: ConfigService
	) {}

  logins: number = 0;
  Player1: number;
  Player2: number;
  client: number;

  @WebSocketServer()
  server: Server;

	handleConnection(client: Socket, @Session() session) {
    console.log("started waitingroom server", session);
		const cookie = parse(String(client.handshake.headers.cookie))
		const name = 'transcendence'
		const secret = this.configService.get('SESSION_SECRET');
		const SID = cookieParser.signedCookie(cookie[name], secret)
		if (GlobalService.sessionId != SID) {
      console.log("session id's don't match, disconnecting");
			client.disconnect();
		}
    this.client = GlobalService.users.get(SID as string);
	}

  @SubscribeMessage('loggedIn')
  async handleSendMessage(client: Socket, payload: any): Promise<void> {
      this.checkWaitingRoom();
  }

  checkWaitingRoom() {
    this.logins = this.logins + 1;
    console.log(this.logins);
    if (this.logins === 2) {
        this.logins = 0;
        this.Player2 = this.client;
        console.log("2 players");
        this.server.emit("found2Players", {
          "Player1": this.Player1,
          "Player2": this.Player2
      });
      this.Player1 = 0;
      this.Player2 = 0;
    }
    else
      this.Player1 = this.client;
  }
}
