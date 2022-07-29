import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import session from "express-session";
import { ConfigService } from '@nestjs/config';
import { Session } from '@nestjs/common';
import { parse } from 'cookie'
import * as cookieParser from 'cookie-parser'
import { GlobalService } from '../global.service';

declare global {
    interface IncomingMessage {
        readonly session: number;
    }
}

@WebSocketGateway({
  cors: {
    origin: 'http://127.0.0.1:3000',
    credentials: true,
  },
})
export class MatchGateway {
	constructor (
		private readonly configService: ConfigService
	) {}

  PinkPong: boolean = true;  //pinkpong (true) or original pong (false) version
  ballSpeed = 9;
  paddleSpeed = 15;
  maxScore = 3;
  
  paddleP1RelX: number;
  paddleP1RelY: number;
  paddleP2RelX: number;
  paddleP2RelY: number;

  leftKeyPressedP1 = false;
  rightKeyPressedP1 = false;
  leftKeyPressedP2 = false;
  rightKeyPressedP2 = false;
  reset = false;
  
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
  paddleHeight = 15;
  ballWidth = 25;

  /* powerups are only available in PinkPong, not in the original */
  paddleSizeMultiplierP1: number = 1;
  paddleSizeMultiplierP2: number = 1;
  powerupStrength: number = 0.3;
  noSizeDownP1: number = 0;
  noSizeDownP2: number = 0;

  @WebSocketServer()
  server: Server;
  
  
	handleConnection(client: Socket, @Session() session) {
    console.log("started");
		console.log("session:", session);
		console.log(client.handshake.headers.cookie);
		const cookie = parse(String(client.handshake.headers.cookie))
		const name = 'transcendence'
		const secret = this.configService.get('SESSION_SECRET');
		const SID = cookieParser.signedCookie(cookie[name], secret)
		console.log("session id from webscoketserver:", SID);
		if (GlobalService.sessionId != SID) {
      console.log("session id's don't match, disconnecting");
			client.disconnect();
		}
    this.loop();
	}

	afterInit(server: Server) {
		console.log('Init');
	}

  @SubscribeMessage('keyPressed')
  async handleSendMessage(client: Socket, payload: any): Promise<void> {
      //console.log("Got a board update, emitting to listeners")
      this.setKeyPresses(payload.leftKeyPressedP1, payload.leftKeyPressedP2, payload.rightKeyPressedP1, payload.rightKeyPressedP2, payload.reset);
  }

  setKeyPresses(leftKeyPressedP1: boolean, leftKeyPressedP2: boolean, rightKeyPressedP1: boolean, rightKeyPressedP2: boolean, reset: boolean) {
    this.leftKeyPressedP1 = leftKeyPressedP1;
    this.leftKeyPressedP2 = leftKeyPressedP2;
    this.rightKeyPressedP1 = rightKeyPressedP1;
    this.rightKeyPressedP2 = rightKeyPressedP2;
    this.reset = reset;
  }

  /*  paddle size */
  powerUpPaddleSize(playerID: number) {
    if (playerID === 1)
      this.paddleSizeMultiplierP1 = this.paddleSizeMultiplierP1 + this.powerupStrength;
    else if (playerID === 2)
      this.paddleSizeMultiplierP2 = this.paddleSizeMultiplierP2 + this.powerupStrength;
  }
  powerDownPaddleSize(playerID: number) {
    if (playerID === 1)
      this.paddleSizeMultiplierP1 = this.paddleSizeMultiplierP1 - this.powerupStrength;
    else if (playerID === 2)
      this.paddleSizeMultiplierP2 = this.paddleSizeMultiplierP2 - this.powerupStrength;
  }

  handlePowerups(scoringPlayer: number) {
    if (scoringPlayer === 1) {  
      if (this.paddleSizeMultiplierP2 > 1 && this.noSizeDownP2 < 0)
        this.powerDownPaddleSize(2);
      else
        this.noSizeDownP1 = this.noSizeDownP1 + 1;
      this.powerUpPaddleSize(1);
      this.noSizeDownP2 = this.noSizeDownP2 - 1;
    }
    else if (scoringPlayer === 2) {
      if (this.paddleSizeMultiplierP1 > 1 && this.noSizeDownP1 < 0)
        this.powerDownPaddleSize(1);
      else
        this.noSizeDownP2 = this.noSizeDownP2 + 1;
      this.powerUpPaddleSize(2);
      this.noSizeDownP1 = this.noSizeDownP1 - 1;
    }
  }

  ballIsBetweenPaddleP1X() {
    if (this.ballRelX + this.ballWidth > this.paddleP1RelX && this.ballRelX < this.paddleP1RelX + (this.paddleWidth * this.paddleSizeMultiplierP1))
      return true;
    return false;
  }
  ballIsBetweenPaddleP1Y() {
    if (this.ballRelY >= this.paddleP1RelY + this.paddleHeight - 10 && this.ballRelY <= this.paddleP1RelY + this.paddleHeight)
      return true;
    return false;
  }
  ballIsBetweenPaddleP2X() {
    if (this.ballRelX + this.ballWidth >= this.paddleP2RelX && this.ballRelX <= this.paddleP2RelX + (this.paddleWidth * this.paddleSizeMultiplierP2))
      return true;
    return false;
  }
  ballIsBetweenPaddleP2Y() {
    if (this.ballRelY + this.ballWidth >= this.paddleP2RelY && this.ballRelY + this.ballWidth <= this.paddleP2RelY + 10)
      return true;
    return false;
  }

  loop() {
      this.getPositions();
  }

  getPositions() {
    if (this.winner === 0){
      /*	handle top side */
      if (this.ballIsBetweenPaddleP1X() && this.ballIsBetweenPaddleP1Y() && this.ballVY < 0) {
        /*	bounce top paddle */
        this.ballVY = this.ballVY * -1;
      }
      else if (this.ballRelY < this.paddleP1RelY - 10) {
        /*	score a point */
        this.scoreP2 = this.scoreP2 + 1;
        this.handlePowerups(1);
        this.setGame();
      }
      /*	handle bottom side */
      if (this.ballIsBetweenPaddleP2X() && this.ballIsBetweenPaddleP2Y() && this.ballVY > 0) {
        /*	bounce bottom paddle */
        this.ballVY = this.ballVY * -1;
      }
      else if (this.ballRelY + this.ballWidth > this.paddleP2RelY + this.paddleHeight + 10) {
        /*	score a point */
        this.scoreP1 = this.scoreP1 + 1;
        this.handlePowerups(2);
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
      if (this.leftKeyPressedP1 === true && this.paddleP1RelX > 1)
        this.paddleP1RelX = this.paddleP1RelX - (this.paddleSpeed * 1);
      if (this.rightKeyPressedP1 === true && this.paddleP1RelX + (this.paddleWidth * this.paddleSizeMultiplierP1) < this.fieldWidth - 1)
        this.paddleP1RelX = this.paddleP1RelX + (this.paddleSpeed * 1);
      if (this.leftKeyPressedP2 === true && this.paddleP2RelX > 1)
        this.paddleP2RelX = this.paddleP2RelX - (this.paddleSpeed * 1);
      if (this.rightKeyPressedP2 === true && this.paddleP2RelX + (this.paddleWidth * this.paddleSizeMultiplierP2) < this.fieldWidth - 1)
        this.paddleP2RelX = this.paddleP2RelX + (this.paddleSpeed * 1);
    }
    else if (this.winner === -1) {
      this.winner = 0;
      this.setGame();
    }
    else {
      this.setGame();
      return;
    }

    setTimeout(() => {
        this.server.emit('boardUpdated', { 
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
        "paddleSizeMultiplierP2": this.paddleSizeMultiplierP2
      });
      this.loop();
    }, 1000 / 60);
  }

  setGame() {
    if (this.scoreP1 < this.maxScore && this.scoreP2 < this.maxScore) {
      //console.log("play game");
      this.paddleP1RelX = this.fieldWidth / 2 - this.paddleWidth / 2;
      this.paddleP1RelY = 10;
      this.paddleP2RelX = this.fieldWidth / 2 - this.paddleWidth / 2;
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
    else if (this.reset === true) {
      console.log("reset");
      this.winner = -1;
      this.scoreP1 = 0;
      this.scoreP2 = 0;
      this.paddleSizeMultiplierP1 = 1;
      this.paddleSizeMultiplierP2 = 1;
      this.noSizeDownP1 = 0;
      this.noSizeDownP2 = 0;
    }
    else {
      // console.log("set winner");
      if (this.scoreP1 === this.maxScore)
        this.winner = 1;
      else
        this.winner = 2;
      this.server.emit('boardUpdated', { 
        "ballRelX": this.ballRelX, 
        "ballRelY": this.ballRelY, 
        "paddleP1RelX": this.paddleP1RelX, 
        "paddleP1RelY": this.paddleP1RelY, 
        "paddleP2RelX": this.paddleP2RelX, 
        "paddleP2RelY": this.paddleP2RelY, 
        "scoreP1": this.scoreP1, 
        "scoreP2": this.scoreP2,
        "winner": this.winner 
      });
    }
  }
}
