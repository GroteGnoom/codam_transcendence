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
export class PinkPongWaitingRoomGateway {
  constructor (
  private readonly configService: ConfigService
	) {}

  logins: number = 0;
  Player1: number = 0;
  Player2: number = 0;
  client: number = 0;

  @WebSocketServer()
  server: Server;

	handleConnection(client: Socket, @Session() session) {
    console.log("started pink pong waitingroom server", session);
    this.client = getUserFromClient(client, this.configService);
    if (!this.client) {
      console.log("Redirect to home page");
      this.server.emit("redirectHomePinkPong", {"client": client.id});
      this.server.close();
    }
	}

  @SubscribeMessage('playerLeftPinkPong')
  async handlePlayerLeft(client: Socket, payload: any): Promise<void> {
    if (getUserFromClient(client, this.configService)) {
      if (this.logins === 2)
        this.logins = 1;
      else
        this.logins = 0;
    }
    console.log(this.logins);
  }

  @SubscribeMessage('loggedInPinkPong')
  async handleLoggedIn(client: Socket, payload: any): Promise<void> {
      this.checkWaitingRoom();
  }

  checkWaitingRoom() {
    if (this.logins === 0  || this.client != this.Player1)
      this.logins = this.logins + 1;
    console.log("PinkPong: ", this.logins);
    if (this.logins === 2) {
        console.log("Player1: ", this.Player1);
        console.log("Client: ", this.client);
        this.logins = 0;
        this.Player2 = this.client;
        this.client = 0;
        console.log("2 players");
        this.server.emit("found2PlayersPinkPong", {
          "Player1": this.Player1,
          "Player2": this.Player2,
          "PinkPong": true
      });
      this.Player1 = 0;
      this.Player2 = 0;
    }
    else {
      this.Player1 = this.client;
      this.client = 0;
    }
  }
}
