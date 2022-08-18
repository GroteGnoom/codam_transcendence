import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
  } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Session } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getUserFromClient, get_frontend_host } from 'src/utils';
import { MatchService } from '../match/match.service';
import { UsersService } from 'src/users/users.service';

@WebSocketGateway({
  namespace: '/inviteWaitingroom-ws',
  path: '/inviteWaitingroom-ws/socket.io',
  cors: {
    origin: get_frontend_host(),
    credentials: true
  },
})
export class InviteWaitingRoomGateway {
  constructor (
  private readonly configService: ConfigService,
  private readonly matchService: MatchService,
  private readonly userService: UsersService
	) {
    console.log("invite gateway constructor");
  }

  waitingUsers = new Set<number>;
  logins: number = 0;
  Player1: number = 0;
  Player2: number = 0;
  client: number = 0;
  PinkPong: boolean = false;

  @WebSocketServer()
  server: Server;

	handleConnection(client: Socket, @Session() session) {
    console.log("started invite waitingroom server", session);
    if (!getUserFromClient(client, this.configService)) {
      console.log("Redirect to home page");
      this.server.emit("redirectHomeInvite", {"client": client.id});
    }
    else {
      this.waitingUsers.add(getUserFromClient(client, this.configService));
      console.log("Pushed user");
    }
	}

  @SubscribeMessage('playerLeftInvite')
  async handlePlayerLeavesInvite(client: Socket, payload: any): Promise<void> {
    if (getUserFromClient(client, this.configService)) {
      this.waitingUsers.delete(getUserFromClient(client, this.configService));
    }
    console.log("Left: ", this.logins);
  }

  @SubscribeMessage('loggedInInvite')
  async handleLoggedInInvite(client: Socket, payload: any): Promise<void> {
    console.log("Emit received");
    if (!this.Player1)
      this.Player1 = getUserFromClient(client, this.configService);
    else if (!this.Player2)
      this.Player2 = getUserFromClient(client, this.configService);
    this.PinkPong = payload.PinkPong;
    console.log("PinkPong: ", this.PinkPong);
    console.log("Player1: ", this.Player1);
    console.log("Player2: ", this.Player2);
    this.checkWaitingRoom();
  }

  async checkWaitingRoom() {
    if (this.waitingUsers.size >= 2) {
      console.log("Found 2 players");
      const [first] = this.waitingUsers;
      const [, second] = this.waitingUsers;
      console.log("Player1 waitingroom: ", this.Player1);
      console.log("Player2 waitingroom: ", this.Player2);
      await this.server.emit("found2PlayersInvite", {
        "Player1": this.Player1,
        "Player2": this.Player2,
        "PinkPong": this.PinkPong
      });
      this.waitingUsers.delete(first);
      this.waitingUsers.delete(second);
    }
  }
}
