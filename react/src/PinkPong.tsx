import React, { useEffect } from 'react';
import {Navigate, useNavigate } from 'react-router-dom';

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

	var gameEnd: boolean = false;
	var scoreP1: number = 0;
	var scoreP2: number = 0;

	let navigate = useNavigate();

	useEffect(() => {
		canvas = document.getElementById("myCanvas");
		if (!canvas)
			throw ("error");
		ctx = canvas.getContext("2d");
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		
		if (gameEnd === false)
		{
			setGame();
			componentDidMount();
			update();
		}
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
			gameEnd = true;
		}
	}

	function componentDidMount() {
		document.addEventListener("keydown", handleKeyPress, false);
		setInterval(handleKeyPress, 1);
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === "k") {
			if (paddleP1X < canvas.width) {
				paddleP1X = paddleP1X + paddleSpeed;
			}
		}
		if (event.key === "j") {
			if (paddleP1X > 0) {
				paddleP1X = paddleP1X - paddleSpeed;
			}
		}
		if (event.key === "x") {
			if (paddleP2X < canvas.width) {
				paddleP2X = paddleP2X + paddleSpeed;
			}
		}
		if (event.key === "z") {
			if (paddleP2X > 0) {
				paddleP2X = paddleP2X - paddleSpeed;
			}
		}
	}

	function update(){
		if (gameEnd == false){

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
	}
	
	function drawRectangle(x:number, y:number, width:number, height:number, fillColour:string, strokeColour:string) {
		ctx.save();
		ctx.beginPath();
		{
			ctx.fillStyle = fillColour;
			ctx.strokeStyle = strokeColour;
			ctx.rect(x, y, width, height);
			ctx.fill();
			ctx.stroke();
		}
		ctx.closePath();
		ctx.restore();
	}

	function drawText(text:string, x:number, y:number, font:string) {
		ctx.save();
		ctx.beginPath();
		{
			ctx.font = font;
			ctx.fillText(text, x, y);
		}
		ctx.closePath();
		ctx.restore();
	}

	function draw(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		//background
		drawRectangle(0, 0, canvas.width, canvas.height, 'pink', 'pink');
		//score P1
		drawText(scoreP1.toString(), 600, 300, '48px serif');
		//score P2
		drawText(scoreP2.toString(), 600, 800, '48px serif');
		//paddle P1
		drawRectangle(paddleP1X, paddleP1Y, paddleWidth, paddleHeight, 'black', 'yellow');
		//paddle P2
		drawRectangle(paddleP2X, paddleP2Y, paddleWidth, paddleHeight, 'white', 'yellow');
		//ball
		drawRectangle(ballX, ballY, ballWidth, ballWidth, 'blue', 'yellow');
		if (gameEnd == true)
			endGame();
		else
			requestAnimationFrame(update);
	}

	function endGame() {
		setTimeout(() => {
			navigate("/", { replace: true });}, 5000); //Reroute to home page after 5 seconds

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		//background
		drawRectangle(0, 0, canvas.width, canvas.height, 'pink', 'pink');
		//Show winner
		if (scoreP1 == maxScore)
			drawText("Player 1 has won!", 440, 400, '64px serif');
		else
			drawText("Player 2 has won!", 440, 400, '64px serif');
		//Show score
		drawText(scoreP1.toString() + " - " + scoreP2.toString(), 600, 600, '48px serif');
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
