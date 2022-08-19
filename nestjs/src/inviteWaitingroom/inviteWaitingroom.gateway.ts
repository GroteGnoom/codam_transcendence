import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
  } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Session } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getUserFromClient, get_frontend_host } from 'src/utils';

class Game {
  constructor(
    user:number,
    Player1:number,
    Player2:number,
    PinkPong:boolean,

    ) {
      this.user = user;
      this.Player1 = Player1;
      this.Player2 = Player2;
      this.PinkPong = PinkPong;
    };
  user: number;
  Player1: number;
  Player2: number;
  PinkPong: boolean;
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
	) {}

  waitingUsers = new Array<Game>;
  user: number = 0;
  Player1: number = 0;
  Player2: number = 0;
  PinkPong: boolean = false;
  alreadyExists: boolean = false;

  @WebSocketServer()
  server: Server;

	handleConnection(client: Socket, @Session() session) {
    if (!getUserFromClient(client, this.configService)) {
      this.server.emit("redirectHomeInvite", {"client": client.id});
    }
	}

  @SubscribeMessage('playerLeftInvite')
  async handlePlayerLeavesInvite(client: Socket, payload: any): Promise<void> {
    if (getUserFromClient(client, this.configService)) {
      const obj = [...this.waitingUsers].findIndex(obj => obj.user === getUserFromClient(client, this.configService));
      this.waitingUsers.splice(obj);
    }
    this.Player1 = 0;
  }

  @SubscribeMessage('loggedIn')
  async handleLoggedIn(client: Socket, payload: any) {
    let user:number = await getUserFromClient(client, this.configService);
    if (!user) {
      await this.server.emit("redirectHomeInvite", {"client": client.id});
    } else {
      await this.waitingUsers.forEach((game) => {
        if (Number(user) === Number(game.user))
          this.alreadyExists = true;
      });
      if (this.alreadyExists === false) {
        this.user = user;
        this.Player1 = payload.Player1;
        this.Player2 = payload.Player2;
        this.PinkPong = payload.PinkPong;
        this.checkWaitingRoom();
      }
      this.alreadyExists = false;
    }
  }

  @SubscribeMessage('loggedInInvite')
  async handleLoggedInInvite(client: Socket, payload: any): Promise<void> {
    let user:number = await getUserFromClient(client, this.configService);
    this.waitingUsers.push(new Game(user, payload.Player1, payload.Player2, payload.PinkPong));
  }

  async checkWaitingRoom() {
    this.waitingUsers.forEach(async (game) => {
        if ((Number(this.user) === Number(game.Player1) || Number(this.user) === Number(game.Player2)) 
          && Number(game.Player1) === Number(this.Player1) && Number(game.Player2) === Number(this.Player2) 
            && Boolean(this.PinkPong) === Boolean(game.PinkPong)) {
          await this.server.emit("found2PlayersInvite", {
            "Player1": game.Player1,
            "Player2": game.Player2,
            "PinkPong": game.PinkPong
          });
          const obj = [...this.waitingUsers].findIndex(obj => obj === game);
          await this.waitingUsers.splice(obj, 1);
        }
      }
    );
  }
}
