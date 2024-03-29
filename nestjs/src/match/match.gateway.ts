import { Session } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { getUserFromClient, get_frontend_host } from 'src/utils';
import { UsersService } from '../users/users.service';
import { MatchService } from './match.service';

class gameState {
  constructor(
    private userService: UsersService,
    Player1:number,
    Player2:number,
    matchID:number,
    PinkPong:boolean,

    ) {
      this.Player1 = Player1;
      this.Player2 = Player2;
      this.matchID = matchID;
      this.PinkPong = PinkPong;
      this.start = Date.now();
      this.getUsernames();
    };

  Player1:number;
  Player2:number;
  matchID:number;
  PinkPong:boolean;

  userName1: string;
  userName2: string;
    
  ballSpeed = 12;
  paddleSpeed = 8;
  maxAngle = 3 * Math.PI / 12;
  maxScore = 11;

  paddleP1RelX: number;
  paddleP1RelY: number;
  paddleP2RelX: number;
  paddleP2RelY: number;

  leftKeyPressedP1 = false;
  rightKeyPressedP1 = false;
  leftKeyPressedP2 = false;
  rightKeyPressedP2 = false;

  userID: number;
  start:number;

  ballRelX: number;
  ballRelY: number;
  ballVX: number;
  ballVY: number;

  winner: number = -1;
  scoreP1: number = 0;
  scoreP2: number = 0;

  fieldWidth = 1500;
  fieldHeight = 1000;
  paddleWidth = 100;
  paddleHeight = 20;
  ballWidth = 20;

  /* powerups are only available in PinkPong, not in the original */
  paddleSizeMultiplierP1: number = 1;
  paddleSizeMultiplierP2: number = 1;
  powerupStrength: number = 0.25;

  async getUsernames() {
    const np1 = await this.userService.findUsersById(this.Player1);
    this.userName1 = np1.username;
    const np2 = await this.userService.findUsersById(this.Player2);
    this.userName2 = np2.username;
  }

  setKeyPresses(leftKeyPressed: boolean, rightKeyPressed: boolean, client: number) {
    if (Number(client) === Number(this.Player1)) {
      this.leftKeyPressedP1 = leftKeyPressed;
      this.rightKeyPressedP1 = rightKeyPressed;
    }
    if (Number(client) === Number(this.Player2)) {
      this.leftKeyPressedP2 = leftKeyPressed;
      this.rightKeyPressedP2 = rightKeyPressed;
    }
  }

  getPlayers() {
    return ({
      "Player1": this.Player1,
      "Player2": this.Player2
    });
  }

  update() {
    if (this.winner === 0){
      if (Date.now() - this.start > 1000) {
        /*	handle top side */
        if (this.ballIsBetweenPaddleP1X() && this.ballIsBetweenPaddleP1Y() && this.ballVY < 0) {
          /*	bounce top paddle */
          let relativeHit = (this.paddleP1RelX + ((this.paddleWidth * this.paddleSizeMultiplierP1) / 2)) - (this.ballRelX + (this.ballWidth / 2));
          let bounceAngle;
          if (this.PinkPong)
            bounceAngle = (relativeHit / ((this.paddleWidth * this.paddleSizeMultiplierP1) / 2)) * this.maxAngle;
          else
            bounceAngle = (relativeHit / (this.paddleWidth / 2)) * this.maxAngle;
          this.ballVY = this.ballSpeed * Math.cos(bounceAngle);
          this.ballVX = this.ballSpeed * (Math.sin(bounceAngle) * -1);
        }
        else if (this.ballRelY < this.paddleP1RelY - 10) {
          /*	score a point */
          if (this.PinkPong)
            this.handlePowerups(1);
          this.start = Date.now();
          this.scoreP2 = this.scoreP2 + 1;
          this.setGame();
        }
        /*	handle bottom side */
        if (this.ballIsBetweenPaddleP2X() && this.ballIsBetweenPaddleP2Y() && this.ballVY > 0) {
          /*	bounce bottom paddle */
          let relativeHit = (this.paddleP2RelX + ((this.paddleWidth * this.paddleSizeMultiplierP2)/ 2)) - (this.ballRelX + (this.ballWidth / 2));
          let bounceAngle = (relativeHit / ((this.paddleWidth * this.paddleSizeMultiplierP2) / 2)) * this.maxAngle;
          this.ballVX = this.ballSpeed * (Math.sin(bounceAngle) * -1);
          this.ballVY = this.ballSpeed * (Math.cos(bounceAngle) * -1);
        }
        else if (this.ballRelY + this.ballWidth > this.paddleP2RelY + this.paddleHeight + 10) {
          /*	score a point */
          if (this.PinkPong)
            this.handlePowerups(2);
          this.start = Date.now();
          this.scoreP1 = this.scoreP1 + 1;
          this.setGame();
        }
        /*	bounce east wall */
        if (this.ballRelX + this.ballWidth > this.fieldWidth && this.ballVX > 0) {
          this.ballVX = this.ballVX * -1;
        }
        /*	bounce west wall */
        else if (this.ballRelX <= 0 && this.ballVX < 0) {
          this.ballVX = this.ballVX * -1;
        }

      

        /*	calculate next position */
        this.ballRelX = this.ballRelX + this.ballVX;
        this.ballRelY = this.ballRelY + this.ballVY;
        /*	calculate paddle positions */
        if (this.leftKeyPressedP1 === true && this.paddleP1RelX > 0)
          this.paddleP1RelX = this.paddleP1RelX - (this.paddleSpeed * 1);
        if (this.rightKeyPressedP1 === true && this.paddleP1RelX + (this.paddleWidth * this.paddleSizeMultiplierP1) < this.fieldWidth)
          this.paddleP1RelX = this.paddleP1RelX + (this.paddleSpeed * 1);
        if (this.leftKeyPressedP2 === true && this.paddleP2RelX > 0)
          this.paddleP2RelX = this.paddleP2RelX - (this.paddleSpeed * 1);
        if (this.rightKeyPressedP2 === true && this.paddleP2RelX + (this.paddleWidth * this.paddleSizeMultiplierP2) < this.fieldWidth)
          this.paddleP2RelX = this.paddleP2RelX + (this.paddleSpeed * 1);

        if (this.paddleP1RelX < 0)
          this.paddleP1RelX = 0;
        else if (this.paddleP1RelX > this.fieldWidth - (this.paddleWidth * this.paddleSizeMultiplierP1))
          this.paddleP1RelX = this.fieldWidth - (this.paddleWidth * this.paddleSizeMultiplierP1);
        if (this.paddleP2RelX < 0)
          this.paddleP2RelX = 0;
        else if (this.paddleP2RelX > this.fieldWidth - (this.paddleWidth * this.paddleSizeMultiplierP2))
          this.paddleP2RelX = this.fieldWidth - (this.paddleWidth * this.paddleSizeMultiplierP2);
      }
    }
    else if (this.winner === -1) {
      this.setGame();
      this.winner = 0;
    }
    else {
      this.setGame();
    }
    return ({ 
      "ballRelX": this.ballRelX, 
      "ballRelY": this.ballRelY, 
      "paddleP1RelX": this.paddleP1RelX, 
      "paddleP1RelY": this.paddleP1RelY, 
      "paddleP2RelX": this.paddleP2RelX, 
      "paddleP2RelY": this.paddleP2RelY, 
      "scoreP1": this.scoreP1, 
      "scoreP2": this.scoreP2,
      "winner": this.winner,
      "paddleSizeMultiplierP1": this.paddleSizeMultiplierP1,
      "paddleSizeMultiplierP2": this.paddleSizeMultiplierP2,
      "namePlayer1" : this.userName1,
      "namePlayer2" : this.userName2,
      "matchID": this.matchID
    })
  };

  setGame() {
    if (this.scoreP1 < this.maxScore && this.scoreP2 < this.maxScore) {
      this.paddleP1RelX = this.fieldWidth / 2 - (this.paddleWidth * this.paddleSizeMultiplierP1) / 2;
      this.paddleP1RelY = 10;
      this.paddleP2RelX = this.fieldWidth / 2 - (this.paddleWidth * this.paddleSizeMultiplierP2) / 2;
      this.paddleP2RelY = this.fieldHeight - 10 - this.paddleHeight;
      this.ballRelX = this.fieldWidth / 2 - this.ballWidth / 2;
      this.ballRelY = this.fieldHeight / 2 - this.ballWidth / 2;
      this.leftKeyPressedP1 = false;
      this.rightKeyPressedP1 = false;
      this.leftKeyPressedP2 = false;
      this.rightKeyPressedP2 = false;
      var up = Math.random() - 0.5;
      if (up > 0)
        this.ballVY = 1;
      else
        this.ballVY = -1;
      this.ballVX =  (Math.random() - 0.5) / 1.5;
      var length = Math.sqrt((this.ballVX * this.ballVX) + (this.ballVY * this.ballVY));
      this.ballVX = this.ballVX / length;
      this.ballVY = this.ballVY / length;
      this.ballVX = this.ballVX * this.ballSpeed;
      this.ballVY = this.ballVY * this.ballSpeed;
    }
    else {
      if (this.scoreP1 === this.maxScore)
        this.winner = 1;
      else
        this.winner = 2;

      return ({ 
          "ballRelX": this.ballRelX, 
          "ballRelY": this.ballRelY, 
          "paddleP1RelX": this.paddleP1RelX, 
          "paddleP1RelY": this.paddleP1RelY, 
          "paddleP2RelX": this.paddleP2RelX, 
          "paddleP2RelY": this.paddleP2RelY, 
          "scoreP1": this.scoreP1, 
          "scoreP2": this.scoreP2,
          "winner": this.winner,
          "matchID": this.matchID
        });
    }
  }

  /*  paddle size */
  powerUpPaddleSize(playerID: number) {
    if (playerID === 1)
      this.paddleSizeMultiplierP1 = this.paddleSizeMultiplierP1 + this.powerupStrength;
    else if (playerID === 2)
      this.paddleSizeMultiplierP2 = this.paddleSizeMultiplierP2 + this.powerupStrength;
  }
  powerDownPaddleSize(playerID: number) {
    if (playerID === 1 && this.paddleSizeMultiplierP2 > 1)
      this.paddleSizeMultiplierP1 = this.paddleSizeMultiplierP2 - this.powerupStrength;
    else if (playerID === 1)
      this.paddleSizeMultiplierP1 = this.paddleSizeMultiplierP2;
    else if (playerID === 2 && this.paddleSizeMultiplierP1 > 1)
      this.paddleSizeMultiplierP2 = this.paddleSizeMultiplierP1 - this.powerupStrength;
    else if (playerID === 2)
      this.paddleSizeMultiplierP2 = this.paddleSizeMultiplierP1;
  }

  handlePowerups(scoringPlayer: number) {
    if (scoringPlayer === 1) {  
      if (this.paddleSizeMultiplierP2 > 1)
        this.powerDownPaddleSize(2);
      this.powerUpPaddleSize(1);
    }
    else if (scoringPlayer === 2) {
      if (this.paddleSizeMultiplierP1 > 1)
        this.powerDownPaddleSize(1);
      this.powerUpPaddleSize(2);
    }
  }

  ballIsBetweenPaddleP1X() {
    if (this.ballRelX + this.ballWidth > this.paddleP1RelX && this.ballRelX < this.paddleP1RelX + (this.paddleWidth * this.paddleSizeMultiplierP1))
      return true;
    return false;
  }
  ballIsBetweenPaddleP1Y() {
    if (this.ballRelY >= this.paddleP1RelY + this.paddleHeight - 20 && this.ballRelY <= this.paddleP1RelY + this.paddleHeight)
      return true;
    return false;
  }
  ballIsBetweenPaddleP2X() {
    if (this.ballRelX + this.ballWidth >= this.paddleP2RelX && this.ballRelX <= this.paddleP2RelX + (this.paddleWidth * this.paddleSizeMultiplierP2))
      return true;
    return false;
  }
  ballIsBetweenPaddleP2Y() {
    if (this.ballRelY + this.ballWidth * 1.3 >= this.paddleP2RelY && this.ballRelY + this.ballWidth * 1.3 <= this.paddleP2RelY + 20)
      return true;
    return false;
  }
}

@WebSocketGateway({
  namespace: '/match-ws',
  path: '/match-ws/socket.io',
  cors: {
    origin: get_frontend_host(),
    credentials: true
  },
})
export class MatchGateway {
  interval: any;
  slowinterval: any;

  constructor(
    private readonly configService: ConfigService,
    private readonly matchService: MatchService,
	  private userService: UsersService,
    ) {
      this.interval = setInterval(this.loop.bind(this), 1000 / 60);
      this.slowinterval = setInterval(this.slowLoop.bind(this), 3000);
    }

  @WebSocketServer()
  server: Server;

  Player1ID:number;
  matchID:number;

  matchStarted: number = 0;

  currentGameStates = new Map<number, gameState>;
  
  handleConnection(client: Socket, @Session() session) {
    if (!getUserFromClient(client, this.configService)) {
      this.server.emit("redirectHomeMatch", {"client": client.id});
    }
  }

  async emitGames() {
	  let gameArray = [];
	  for (const [matchId, gameState] of this.currentGameStates) {
		  await gameState.getUsernames();
		  gameArray.push({
            userName1: gameState.userName1,
						userName2: gameState.userName2, 
						matchID: gameState.matchID,
            Player1: gameState.Player1,
            Player2: gameState.Player2
		  });
	  }
	  this.server.emit('matches', gameArray);
  }

  @SubscribeMessage('getGames')
  getGames(client: Socket, payload: any): void {
    if (!getUserFromClient(client, this.configService)) {
      this.server.emit("redirectHomeMatch", {"client": client.id});
    }
	  this.emitGames();
  }

  @SubscribeMessage('startGame')
  async startGame(client: Socket, payload: any): Promise<void> {
    const player = getUserFromClient(client, this.configService);
    if (!player) {
      this.server.emit("redirectHomeMatch", {"client": client.id});
    }
    if (Number(player) === Number(payload.Player1) || Number(player) === Number(payload.Player2))
      this.matchStarted = this.matchStarted + 1;
    else
      this.server.emit("redirectHomeMatch", {"client": client.id});
    if (this.matchStarted === 2) {
      this.matchStarted = 0;
      
      const match = await this.matchService.addMatch(payload.Player1, payload.Player2);
      const matchID:number = match.id;

      this.server.emit('matchID', {"matchID": matchID, "userID": payload.Player1});
      this.server.emit('matchID', {"matchID": matchID, "userID": payload.Player2});
      
      this.currentGameStates.set(matchID, new gameState(this.userService, payload.Player1, payload.Player2, matchID, payload.PinkPong));
      
	    this.emitGames();
    }
  }

  slowLoop() {
    this.currentGameStates.forEach((gameState, matchID) => {
		const emitMessage = gameState.getPlayers();
		this.server.emit('matchID', {"matchID": matchID, "userID": emitMessage.Player1});
		this.server.emit('matchID', {"matchID": matchID, "userID": emitMessage.Player2});
    });
    
  }

  loop() {
    this.currentGameStates.forEach((gameState, matchID) => {
      const emitMessage = gameState.update();
      this.server.emit('boardUpdated', emitMessage);
      if (emitMessage.winner === 1 || emitMessage.winner === 2) {
        this.matchService.storeResult(emitMessage.matchID, emitMessage.scoreP1, emitMessage.scoreP2, this.server);
        this.currentGameStates.delete(matchID);
		this.emitGames();
      }
    });
  }

  @SubscribeMessage('keyPressed')
  async handleKeyPressed(client: Socket, payload: any): Promise<void> {
      const userID = getUserFromClient(client, this.configService);
      if (!userID) {
        this.server.emit("redirectHomeMatch", {"client": client.id});
      }
      const gameState = this.currentGameStates.get(payload.matchID);
      if (gameState)
        gameState.setKeyPresses(payload.leftKeyPressed, payload.rightKeyPressed, userID);
  }

}
