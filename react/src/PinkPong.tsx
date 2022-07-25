import React, { useEffect } from 'react';
import Home from './Home';
import {Route} from 'react-router-dom';

export default function PinkPong() {
	const paddleWidth = 100;
	const paddleHeight = 25;
	const ballWidth = 25;
	const ballSpeed = 3;
	const paddleSpeed = 10;
	const maxScore = 3;

	var canvas: any;
	var ctx: any;

	var paddleP1X: number;
	var paddleP1Y: number;
	var paddleP2X: number;
	var paddleP2Y: number;

	var ballX: number;
	var ballY: number;
	var ballVX: number;
	var ballVY: number;

	var scoreP1: number = 0;
	var scoreP2: number = 0;

	useEffect(() => {
		canvas = document.getElementById("myCanvas");
		if (!canvas)
			throw ("error");
		ctx = canvas.getContext("2d");
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		
		setGame();
		componentDidMount();
		update();
	}, []);
	
	function setGame() {
		if (scoreP1 < maxScore && scoreP2 < maxScore) {
			paddleP1X = 600;
			paddleP1Y = 100;
			paddleP2X = 600;
			paddleP2Y = 1000;
			ballX = 625;
			ballY = 500;
			var up = Math.random() - 0.5;
			if (up > 0)
				ballVY = 1;
			else
				ballVY = -1;
			ballVX =  Math.random() - 0.5;
			var length = Math.sqrt((ballVX * ballVX) + (ballVY * ballVY));
			ballVX = ballVX / length;
			ballVY = ballVY / length;
			ballVX = ballVX * ballSpeed;
			ballVY = ballVY * ballSpeed;
		}
		else {
			//end the game
			//	https://reactrouter.com/docs/en/v6/components/navigate
		}
	}

	function componentDidMount() {
		document.addEventListener("keydown", handleKeyPress, false);
		setInterval(handleKeyPress, 1);
	}
	function componentWillUnmount(){
		document.removeEventListener("keydown", handleKeyPress, false);
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === "k") {
			if (paddleP1X < canvas.width) {
				paddleP1X = paddleP1X + paddleSpeed;
				// this.setState({paddleX: this.state.paddleX + 10});
			}
		}
		if (event.key === "j") {
			if (paddleP1X > 0) {
				paddleP1X = paddleP1X - paddleSpeed;
				// this.setState({paddleX: this.state.paddleX - 10});
			}
		}
		if (event.key === "x") {
			if (paddleP2X < canvas.width) {
				paddleP2X = paddleP2X + paddleSpeed;
				// this.setState({Opponent: this.state.Opponent + 10});
			}
		}
		if (event.key === "z") {
			if (paddleP2X > 0) {
				paddleP2X = paddleP2X - paddleSpeed;
				// this.setState({Opponent: this.state.Opponent - 10});
			}
		}
	}

	function update(){
		/*	handle top side */
		if ((ballX + ballWidth > paddleP1X && ballX <= paddleP1X + paddleWidth) && ballY - ballWidth <= paddleP1Y + paddleHeight)
		{
			/*	bounce top paddle */
			ballVY = ballVY * -1;
		}
		else if (ballY < paddleP1Y)
		{
			/*	score a point */
			scoreP2 = scoreP2 + 1;
			setGame();
		}
		/*	handle bottom side */
		if ((ballX + ballWidth > paddleP2X && ballX <= paddleP2X + paddleWidth) && ballY + ballWidth >= paddleP2Y)
		{
			/*	bounce bottom paddle */
			ballVY = ballVY * -1;
		}
		else if (ballY > paddleP2Y)
		{
			/*	score a point */
			scoreP1 = scoreP1 + 1;
			setGame();
		}
		/*	bounce east wall */
		if (ballX + ballWidth > canvas.width && ballVX > 0)
		{
			ballVX = ballVX * -1;
		}
		/*	bounce west wall */
		else if (ballX - ballWidth <= 0 && ballVX < 0)
		{
			ballVX = ballVX * -1;
		}

		/*	calculate next position */
		ballY = ballY + ballVY;
		ballX = ballX + ballVX;
		draw();
	}

	function draw(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		//background
		ctx.save();
		ctx.beginPath();
		{
			ctx.fillStyle = 'pink';
			ctx.rect(0, 0, canvas.width, canvas.height);
			ctx.fill();
		}
		ctx.closePath();
		ctx.restore();
		//score P1
		ctx.save();
		ctx.beginPath();
		{
			ctx.font = '48px serif';
			ctx.fillText(scoreP1.toString(), 600, 300);
		}
		ctx.closePath();
		ctx.restore();
		//score P2
		ctx.save();
		ctx.beginPath();
		{
			ctx.font = '48px serif';
			ctx.fillText(scoreP2.toString(), 600, 800);
		}
		ctx.closePath();
		ctx.restore();
		//paddle P1
		ctx.save();
		ctx.beginPath();
		{
			ctx.fillStyle = 'black';
			ctx.strokeStyle = 'yellow';
			ctx.rect(paddleP1X, paddleP1Y, paddleWidth, paddleHeight);
			ctx.fill();
			ctx.stroke();
		}
		ctx.closePath();
		ctx.restore();
		//paddle P2
		ctx.save();
		ctx.beginPath();
		{
			ctx.fillStyle = 'white';
			ctx.strokeStyle = 'yellow';
			ctx.rect(paddleP2X, paddleP2Y, paddleWidth, paddleHeight);
			ctx.fill();
			ctx.stroke();
		}
		ctx.closePath();
		ctx.restore();
		//ball
		ctx.save();
		ctx.beginPath();
		{
			ctx.fillStyle = 'blue';
			ctx.strokeStyle = 'yellow';
			ctx.arc(ballX, ballY, ballWidth, -1.5 * Math.PI, 1.5 * Math.PI);
			ctx.fill();
			ctx.stroke();
		}
		ctx.closePath();
		ctx.restore();
		requestAnimationFrame(update);
	}


  return (
    <div>
      <canvas
        id="myCanvas"
      >
        Your browser does not support the HTML canvas tag.
      </canvas>
    </div>
  );
}
