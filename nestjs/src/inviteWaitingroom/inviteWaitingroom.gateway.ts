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

var game = {
  "user": 0,
  "Player1": 0,
  "Player2": 0,
  "PinkPong": false
}

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

  waitingUsers = new Set<typeof game>;
  user: number = 0;
  Player1: number = 0;
  Player2: number = 0;
  PinkPong: boolean = false;
  alreadyExists: boolean = false;

  @WebSocketServer()
  server: Server;

	handleConnection(client: Socket, @Session() session) {
    console.log("started invite waitingroom server", session);
    if (!getUserFromClient(client, this.configService)) {
      console.log("Redirect to home page");
      this.server.emit("redirectHomeInvite", {"client": client.id});
    }
	}

  @SubscribeMessage('playerLeftInvite')
  async handlePlayerLeavesInvite(client: Socket, payload: any): Promise<void> {
    if (getUserFromClient(client, this.configService)) {
      const obj = [...this.waitingUsers].find(obj => obj.user === getUserFromClient(client, this.configService));
      this.waitingUsers.delete(obj);
    }
    this.Player1 = 0;
    console.log("Left: ", this.waitingUsers.size);
  }

  @SubscribeMessage('loggedIn')
  async handleLoggedIn(client: Socket, payload: any) {
    let user:number = await getUserFromClient(client, this.configService);
    if (!user) {
      console.log("Redirect to home page");
      this.server.emit("redirectHomeInvite", {"client": client.id});
    } else {
      this.waitingUsers.forEach((game) => {
        if (Number(user) === Number(game.user))
          this.alreadyExists = true;
      });
      if (this.alreadyExists === false) {
        this.user = user;
        this.Player1 = payload.Player1;
        this.Player2 = payload.Player2;
        this.PinkPong = payload.PinkPong;
        console.log("Pushed user");
        console.log("PinkPong this: ", this.PinkPong);
        console.log("Player1 this: ", this.Player1);
        console.log("Player2 this: ", this.Player2);
        this.checkWaitingRoom();
      }
      this.alreadyExists = false;
    }
  }

  @SubscribeMessage('loggedInInvite')
  async handleLoggedInInvite(client: Socket, payload: any): Promise<void> {
    console.log("Emit received");
    let user:number = await getUserFromClient(client, this.configService);
    game.user = user;
    game.Player1 = payload.Player1;
    game.Player2 = payload.Player2;
    game.PinkPong = payload.PinkPong;
    this.waitingUsers.add(game);
    console.log("Pushed user");
    console.log("PinkPong game: ", game.PinkPong);
    console.log("Player1 game: ", game.Player1);
    console.log("Player2 game: ", game.Player2);
  }

  async checkWaitingRoom() {
    this.waitingUsers.forEach((game) => {
        if ((Number(this.user) === Number(game.Player1) || Number(this.user) === Number(game.Player2)) 
          && Number(game.Player1) === Number(this.Player1) && Number(game.Player2) === Number(this.Player2) 
            && Boolean(this.PinkPong) === Boolean(game.PinkPong)) {
          this.server.emit("found2PlayersInvite", {
            "Player1": game.Player1,
            "Player2": game.Player2,
            "PinkPong": game.PinkPong
          });
          this.waitingUsers.delete(game);
        }
      }
    );
  }
}
