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

  waitingUsers: number[] = [];
  logins: number = 0;
  Player1: number = 0;
  Player2: number = 0;
  client: number = 0;

  @WebSocketServer()
  server: Server;

	handleConnection(client: Socket, @Session() session) {
    console.log("started classic waitingroom server", session);
    if (!getUserFromClient(client, this.configService)) {
      console.log("Redirect to home page");
      this.server.emit("redirectHomeClassic", {"client": client.id});
      this.server.close();
    }
    else {
      this.waitingUsers.push(getUserFromClient(client, this.configService));
      console.log("Pushed user");
    }
	}

  @SubscribeMessage('playerLeftClassic')
  async handlePlayerLeaves(client: Socket, payload: any): Promise<void> {
    if (getUserFromClient(client, this.configService)) {
      let index = this.waitingUsers.indexOf(getUserFromClient(client, this.configService));
      this.waitingUsers.splice(index, 1);
    }
    console.log("Left: ", this.logins);
  }

  @SubscribeMessage('loggedInClassic')
  async handleLoggedIn(client: Socket, payload: any): Promise<void> {
      this.checkWaitingRoom();
  }

  getUser(user:number) {
    return (user);
  }

  async checkWaitingRoom() {
    if (this.waitingUsers.length >= 2) {
      console.log("Found 2 players");
      this.Player1 = await this.getUser(this.waitingUsers[0]);
      this.Player2 = await this.getUser(this.waitingUsers[1]);
      await this.server.emit("found2PlayersClassic", {
        "Player1": this.Player1,
        "Player2": this.Player2,
        "PinkPong": false
      });
      this.waitingUsers.splice(0, 2);
    }
  }
}
