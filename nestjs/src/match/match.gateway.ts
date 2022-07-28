import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})

export class MatchGateway {
    PinkPong: boolean = true;  //pinkpong (true) or original pong (false) version
    ballSpeed = 4;
    paddleSpeed = 7;
    maxScore = 1;
    
    paddleP1RelX: number;
    paddleP1RelY: number;
    paddleP2RelX: number;
    paddleP2RelY: number;
    
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
    
    @WebSocketServer()
    server: Server;
  
    @SubscribeMessage('keyPressed')
    async handleSendMessage(client: Socket, payload: any): Promise<void> {
        // console.log("Got a board update, emitting to listeners")
        if (this.PinkPong)
          this.handlePowerups();
        this.getPositions(payload.leftKeyPressedP1, payload.leftKeyPressedP2, payload.rightKeyPressedP1, payload.rightKeyPressedP2, payload.reset);
        }
  
        /* powerups are only available in PinkPong, not in the original */
        paddleSpeedMultiplierP1: number = 1;
        paddleSpeedMultiplierP2: number = 1;
        paddleSizeMultiplierP1: number = 1;
        paddleSizeMultiplierP2: number = 1;
        ballSpeedMultiplier: number = 1;
    
        /*  paddle speed */
        powerUpPaddleSpeed(playerID: number) {
            if (playerID === 1)
              this.paddleSpeedMultiplierP1 = 2;
            else if (playerID === 2)
              this.paddleSpeedMultiplierP2 = 2;
        }
        powerDownPaddleSpeed(playerID: number) {
            if (playerID === 1)
              this.paddleSpeedMultiplierP1 = 1;
            else if (playerID === 2)
              this.paddleSpeedMultiplierP2 = 1;
        }
        /*  paddle size */
        powerUpPaddleSize(playerID: number) {
            if (playerID === 1)
              this.paddleSizeMultiplierP1 = 2;
            else if (playerID === 2)
              this.paddleSizeMultiplierP2 = 2;
        }
        powerDownPaddleSize(playerID: number) {
            if (playerID === 1)
              this.paddleSizeMultiplierP1 = 1;
            else if (playerID === 2)
              this.paddleSizeMultiplierP2 = 1;
        }

    handlePowerups() {
        this.powerDownPaddleSize(1);
        this.powerDownPaddleSize(2);
      if (this.scoreP1 < this.scoreP2)
        this.powerUpPaddleSize(1);
      else if (this.scoreP2 < this.scoreP1)
        this.powerUpPaddleSize(2);
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

    getPositions(leftKeyPressedP1: boolean, leftKeyPressedP2: boolean, rightKeyPressedP1: boolean, rightKeyPressedP2: boolean, reset: boolean) {
      if (this.winner === 0){
        /*	handle top side */
        if (this.ballIsBetweenPaddleP1X() && this.ballIsBetweenPaddleP1Y() && this.ballVY < 0) {
          /*	bounce top paddle */
          this.ballVY = this.ballVY * -1;
        }
        else if (this.ballRelY < this.paddleP1RelY - 10) {
          /*	score a point */
          this.scoreP2 = this.scoreP2 + 1;
          this.setGame(leftKeyPressedP1, leftKeyPressedP2, rightKeyPressedP1, rightKeyPressedP2, reset);
        }
        /*	handle bottom side */
        if (this.ballIsBetweenPaddleP2X() && this.ballIsBetweenPaddleP2Y() && this.ballVY > 0) {
          /*	bounce bottom paddle */
          this.ballVY = this.ballVY * -1;
        }
        else if (this.ballRelY + this.ballWidth > this.paddleP2RelY + this.paddleHeight + 10) {
          /*	score a point */
          this.scoreP1 = this.scoreP1 + 1;
          this.setGame(leftKeyPressedP1, leftKeyPressedP2, rightKeyPressedP1, rightKeyPressedP2, reset);
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
        if (leftKeyPressedP1 === true && this.paddleP1RelX > 1)
          this.paddleP1RelX = this.paddleP1RelX - (this.paddleSpeed * 1);
        if (rightKeyPressedP1 === true && this.paddleP1RelX + (this.paddleWidth * this.paddleSizeMultiplierP1) < this.fieldWidth - 1)
          this.paddleP1RelX = this.paddleP1RelX + (this.paddleSpeed * 1);
        if (leftKeyPressedP2 === true && this.paddleP2RelX > 1)
          this.paddleP2RelX = this.paddleP2RelX - (this.paddleSpeed * 1);
        if (rightKeyPressedP2 === true && this.paddleP2RelX + (this.paddleWidth * this.paddleSizeMultiplierP2) < this.fieldWidth - 1)
          this.paddleP2RelX = this.paddleP2RelX + (this.paddleSpeed * 1);
        }
        else if (this.winner === -1) {
          this.winner = 0;
          this.setGame(leftKeyPressedP1, leftKeyPressedP2, rightKeyPressedP1, rightKeyPressedP2, reset);
        }
        else {
          this.setGame(leftKeyPressedP1, leftKeyPressedP2, rightKeyPressedP1, rightKeyPressedP2, reset);
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
          })
          }, 2);


        // //send relative coordinates of paddles and ball to frontend
        // console.log("send game stats");
        // this.server.emit('boardUpdated', { 
        //   "ballRelX": this.ballRelX, 
        //   "ballRelY": this.ballRelY, 
        //   "paddleP1RelX": this.paddleP1RelX, 
        //   "paddleP1RelY": this.paddleP1RelY, 
        //   "paddleP2RelX": this.paddleP2RelX, 
        //   "paddleP2RelY": this.paddleP2RelY, 
        //   "scoreP1": this.scoreP1, 
        //   "scoreP2": this.scoreP2,
        //   "winner": this.winner
        // });
    }

    setGame(leftKeyPressedP1: boolean, leftKeyPressedP2: boolean, rightKeyPressedP1: boolean, rightKeyPressedP2: boolean, reset: boolean) {
      if (this.scoreP1 < this.maxScore && this.scoreP2 < this.maxScore) {
        console.log("play game");
        this.paddleP1RelX = this.fieldWidth / 2 - this.paddleWidth / 2;
        this.paddleP1RelY = 10;
        this.paddleP2RelX = this.fieldWidth / 2 - this.paddleWidth / 2;
        this.paddleP2RelY = this.fieldHeight - 10 - this.paddleHeight;
        this.ballRelX = this.fieldWidth / 2 - this.ballWidth / 2;
        this.ballRelY = this.fieldHeight / 2 - this.ballWidth / 2;
        leftKeyPressedP1 = false;
        rightKeyPressedP1 = false;
        leftKeyPressedP2 = false;
        rightKeyPressedP2 = false;
        var up = Math.random() - 0.5;
        if (up > 0)
          this.ballVY = 1;
        else
          this.ballVY = -1;
        this.ballVX =  Math.random() - 0.5;
        var length = Math.sqrt((this.ballVX * this.ballVX) + (this.ballVY * this.ballVY));
        this.ballVX = this.ballVX / length;
        this.ballVY = this.ballVY / length;
        this.ballVX = this.ballVX * this.ballSpeed;
        this.ballVY = this.ballVY * this.ballSpeed;
      }
      else if (reset === true) {
        console.log("reset");
        this.winner = -1;
        this.scoreP1 = 0;
        this.scoreP2 = 0;
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
