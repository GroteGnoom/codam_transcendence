import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
  } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Session } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getUserFromClient, get_frontend_host } from 'src/utils';

@WebSocketGateway({
  cors: {
    origin: get_frontend_host(),
    credentials: true
  },
})
export class ClassicWaitingRoomGateway {
  constructor (
  private readonly configService: ConfigService
	) {}

  logins: number = 0;
  Player1: number;
  Player2: number;
  client: number = 0;

  @WebSocketServer()
  server: Server;

	handleConnection(client: Socket, @Session() session) {
    console.log("started classic waitingroom server", session);
    this.client = getUserFromClient(client, this.configService);
	}

  @SubscribeMessage('playerLeftClassic')
  async handlePlayerLeft(client: Socket, payload: any): Promise<void> {
      if (getUserFromClient(client, this.configService))
        this.logins = this.logins - 1;
      console.log(this.logins);
  }

  @SubscribeMessage('loggedInClassic')
  async handleLoggedIn(client: Socket, payload: any): Promise<void> {
      this.checkWaitingRoom();
  }

  checkWaitingRoom() {
    if ((this.logins === 0 && this.client) || this.client !== this.Player1)
      this.logins = this.logins + 1;
    else if (this.client === this.Player1)
      this.server.emit("redirectHomeClassic", {});
    console.log("Classic: ", this.logins);
    if (this.logins === 2) {
        console.log("Player1: ", this.Player1);
        console.log("Client: ", this.client);
        this.logins = 0;
        this.Player2 = this.client;
        this.client = 0;
        console.log("2 players");
        this.server.emit("found2PlayersClassic", {
          "Player1": this.Player1,
          "Player2": this.Player2,
          "PinkPong": false
      });
      this.Player1 = 0;
      this.Player2 = 0;
    }
    else
      this.Player1 = this.client;
  }
}
