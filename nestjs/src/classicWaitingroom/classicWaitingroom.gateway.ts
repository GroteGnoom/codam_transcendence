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
import { MatchGateway } from 'src/match/match.gateway';
import { UsersService } from 'src/users/users.service';

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
  private readonly matchService: MatchService,
  private readonly userService: UsersService
	) {}

  waitingUsers = new Set<number>;
  currentGames = new Set<number>;
  currentGameStates = new Map<number, MatchGateway>;
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
      // this.server.close();
    }
    else {
      this.waitingUsers.add(getUserFromClient(client, this.configService));
      console.log("Pushed user");
    }
	}

  @SubscribeMessage('playerLeftClassic')
  async handlePlayerLeaves(client: Socket, payload: any): Promise<void> {
    if (getUserFromClient(client, this.configService)) {
      this.waitingUsers.delete(getUserFromClient(client, this.configService));
    }
    console.log("Left: ", this.logins);
  }

  @SubscribeMessage('loggedInClassic')
  async handleLoggedIn(client: Socket, payload: any): Promise<void> {
      this.checkWaitingRoom();
  }

  @SubscribeMessage('gameEnded')
  async handleGameEnded(client: Socket, payload: any): Promise<void> {
    this.currentGames.delete(payload.id) ;
    console.log("current classic games: ", this.currentGames.size);
  }

  getUser(user:number) {
    return (user);
  }

  async checkWaitingRoom() {
    if (this.waitingUsers.size >= 2) {
      console.log("Found 2 players");
      const [first] = this.waitingUsers;
      const [, second] = this.waitingUsers;
      this.Player1 = await this.getUser(first);
      this.Player2 = await this.getUser(second);
      console.log("Player1 waitingroom: ", this.Player1);
      console.log("Player2 waitingroom: ", this.Player2);
      const match = await this.matchService.addMatch(this.Player1, this.Player2);
      const matchID:number = match.id;
      const state = await new MatchGateway(this.configService, this.matchService, this.userService, this.Player1, this.Player2, matchID, false);
      this.currentGameStates.set(matchID, state);
      console.log("match ID: ", matchID);
      this.currentGames.add(matchID);
      await this.server.emit("found2PlayersClassic", {
        "Player1": this.Player1,
        "Player2": this.Player2
      });
      this.waitingUsers.delete(first);
      this.waitingUsers.delete(second);
      console.log("current classic games: ", this.currentGames.size);
    }
  }
}
