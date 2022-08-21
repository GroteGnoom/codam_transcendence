import { Session } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { getUserFromClient, get_frontend_host } from 'src/utils';

@WebSocketGateway({
  namespace: '/classicWaitingRoom-ws',
  path: '/classicWaitingRoom-ws/socket.io',
  cors: {
    origin: get_frontend_host(),
    credentials: true
  },
})
export class ClassicWaitingRoomGateway {
  constructor (
  private readonly configService: ConfigService,
	) {}

  waitingUsers = new Set<number>;
  logins: number = 0;
  Player1: number = 0;
  Player2: number = 0;
  client: number = 0;

  @WebSocketServer()
  server: Server;

	handleConnection(client: Socket, @Session() session) {
    if (!getUserFromClient(client, this.configService)) {
      this.server.emit("redirectHomeClassic", {"client": client.id});
    }
    else {
      this.waitingUsers.add(getUserFromClient(client, this.configService));
    }
	}

  @SubscribeMessage('playerLeftClassic')
  async handlePlayerLeaves(client: Socket, payload: any): Promise<void> {
    if (getUserFromClient(client, this.configService)) {
      this.waitingUsers.delete(getUserFromClient(client, this.configService));
    }
  }

  @SubscribeMessage('loggedInClassic')
  async handleLoggedIn(client: Socket, payload: any): Promise<void> {
      this.checkWaitingRoom();
  }

  getUser(user:number) {
    return (user);
  }

  async checkWaitingRoom() {
    if (this.waitingUsers.size >= 2) {
      const [first] = this.waitingUsers;
      const [, second] = this.waitingUsers;
      this.Player1 = await this.getUser(first);
      this.Player2 = await this.getUser(second);
      await this.server.emit("found2PlayersClassic", {
        "Player1": this.Player1,
        "Player2": this.Player2
      });
      this.waitingUsers.delete(first);
      this.waitingUsers.delete(second);
    }
  }
}
