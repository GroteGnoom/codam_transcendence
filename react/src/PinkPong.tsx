import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PinkPong() {
	const fieldWidth = 1500;
	const fieldHeight = 1000;
	const paddleWidth = 100;
	const paddleHeight = 25;
	const ballWidth = 25;
	const ballSpeed = 4;
	const paddleSpeed = 7;
	const maxScore = 3;

	var canvas: any;
	var ctx: any;

	var paddleP1X: number;
	var paddleP1RelX: number;
	var paddleP1Y: number;
	var paddleP1RelY: number;
	var paddleP2X: number;
	var paddleP2RelX: number;
	var paddleP2Y: number;
	var paddleP2RelY: number;

	var ballX: number;
	var ballRelX: number;
	var ballY: number;
	var ballRelY: number;
	var ballVX: number;
	var ballVY: number;

	var leftKeyPressedP1: boolean;
	var rightKeyPressedP1: boolean;
	var leftKeyPressedP2: boolean;
	var rightKeyPressedP2: boolean;

	var gameEnd: boolean = false;
	var scoreP1: number = 0;
	var scoreP2: number = 0;

	let navigate = useNavigate();

	useEffect(() => {
		canvas = document.getElementById("myCanvas");
		if (!canvas)
			console.log("error");
		ctx = canvas.getContext("2d");
		
		setGame();
		componentDidMount();
		update();
	}, []);

	function setGame() {
		if (scoreP1 < maxScore && scoreP2 < maxScore) {
			paddleP1RelX = fieldWidth / 2 - paddleWidth / 2;
			paddleP1RelY = 10;
			paddleP2RelX = fieldWidth / 2 - paddleWidth / 2;
			paddleP2RelY = fieldHeight - 10 - paddleHeight;
			ballRelX = fieldWidth / 2 - ballWidth / 2;
			ballRelY = fieldHeight / 2 - ballWidth / 2;
			leftKeyPressedP1 = false;
			rightKeyPressedP1 = false;
			leftKeyPressedP2 = false;
			rightKeyPressedP2 = false;
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
		document.addEventListener("keyup", handleKeyRelease, false);
	}

	function handleKeyRelease() {
		leftKeyPressedP1 = false;
		rightKeyPressedP1 = false;
		leftKeyPressedP2 = false;
		rightKeyPressedP2 = false;
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === "k") {
			leftKeyPressedP1 = false;
			rightKeyPressedP1 = true;
		}
		if (event.key === "j") {
			rightKeyPressedP1 = false;
			leftKeyPressedP1 = true;
		}
		if (event.key === "x") {
			leftKeyPressedP2 = false;
			rightKeyPressedP2 = true;
		}
		if (event.key === "z") {
			rightKeyPressedP2 = false;
			leftKeyPressedP2 = true;
		}
	}

	function update(){
		if (gameEnd === false){
			// var scrollBarWidth: number = 42;
			/*	handle top side */
			if ((ballRelX + ballWidth > paddleP1RelX && ballRelX < paddleP1RelX + paddleWidth) && (ballRelY >= paddleP1RelY + paddleHeight - 15 && ballRelY <= paddleP1RelY + paddleHeight) && ballVY < 0) {
				/*	bounce top paddle */
				ballVY = ballVY * -1;
			}
			else if (ballRelY < paddleP1RelY - 10) {
				/*	score a point */
				scoreP2 = scoreP2 + 1;
				setGame();
			}
			/*	handle bottom side */
			if ((ballRelX + ballWidth >= paddleP2RelX && ballRelX <= paddleP2RelX + paddleWidth) && (ballRelY + ballWidth >= paddleP2RelY && ballRelY + ballWidth <= paddleP2RelY + 15) && ballVY > 0) {
				/*	bounce bottom paddle */
				ballVY = ballVY * -1;
			}
			else if (ballRelY + ballWidth > paddleP2RelY + paddleHeight + 10) {
				/*	score a point */
				scoreP1 = scoreP1 + 1;
				setGame();
			}
			/*	bounce east wall */
			if (ballX + ballWidth > getFieldX() + fieldWidth && ballVX > 0) {
				ballVX = ballVX * -1;
			}
			/*	bounce west wall */
			else if (ballX - getFieldX() <= 0 && ballVX < 0) {
				ballVX = ballVX * -1;
			}
			/*	calculate next position */
			ballRelX = ballRelX + ballVX;
			ballRelY = ballRelY + ballVY;
			ballX = getFieldX() + ballRelX;
			ballY = getFieldY() + ballRelY;
			/*	calculate paddle positions */
			if (leftKeyPressedP1 === true && paddleP1RelX > 0)
				paddleP1RelX = paddleP1RelX - paddleSpeed;
			if (rightKeyPressedP1 === true && paddleP1RelX + paddleWidth < fieldWidth)
				paddleP1RelX = paddleP1RelX + paddleSpeed;
			paddleP1X = getFieldX() + paddleP1RelX;
			paddleP1Y = getFieldY() + paddleP1RelY;
			if (leftKeyPressedP2 === true && paddleP2RelX > 0)
				paddleP2RelX = paddleP2RelX - paddleSpeed;
			if (rightKeyPressedP2 === true && paddleP2RelX + paddleWidth < fieldWidth)
				paddleP2RelX = paddleP2RelX + paddleSpeed;
			paddleP2X = getFieldX() + paddleP2RelX;
			paddleP2Y = getFieldY() + paddleP2RelY;
		
			draw();
		}
	}
	
	function drawRectangle(x:number, y:number, width:number, height:number, fillColour:string, strokeColour:string) {
		ctx.save();
		ctx.beginPath();
	
		ctx.fillStyle = fillColour;
		ctx.strokeStyle = strokeColour;
		ctx.rect(x, y, width, height);
		ctx.fill();
		ctx.stroke();
	
		ctx.closePath();
		ctx.restore();
	}

	function drawText(text:string, x:number, y:number, font:string) {
		ctx.save();
		ctx.beginPath();
	
		ctx.font = font;
		ctx.fillText(text, x, y);
	
		ctx.closePath();
		ctx.restore();
	}

	function getFieldX() {
		return (canvas.width / 2 - fieldWidth / 2);
	}

	function getFieldY() {
		return (canvas.height / 2 - fieldHeight / 2);
	}

	function draw(){
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		//background
		drawRectangle(0, 0, canvas.width, canvas.height, 'lightpink', 'lightpink');
		//field
		drawRectangle(getFieldX(), getFieldY(), fieldWidth, fieldHeight, 'pink', 'darkpink');
		//score P1
		drawText(scoreP1.toString(), getFieldX() + fieldWidth / 2, getFieldY() + fieldHeight / 3, '48px serif');
		//score P2
		drawText(scoreP2.toString(), getFieldX() + fieldWidth / 2, getFieldY() + (fieldHeight / 3) * 2, '48px serif');
		//paddle P1
		drawRectangle(paddleP1X, paddleP1Y, paddleWidth, paddleHeight, 'black', 'yellow');
		//paddle P2
		drawRectangle(paddleP2X, paddleP2Y, paddleWidth, paddleHeight, 'white', 'yellow');
		//ball
		drawRectangle(ballX, ballY, ballWidth, ballWidth, 'blue', 'yellow');
		if (gameEnd === true)
			endGame();
		else
			requestAnimationFrame(update);
	}
	
	function endGame() {
		setTimeout(() => {
			navigate("/", { replace: true });}, 5000); //Reroute to home page after 5 seconds
		
		getWindowSize();
	}

	function getWindowSize() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		drawEndScreen();
	}

	function drawEndScreen() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		//background
		drawRectangle(0, 0, canvas.width, canvas.height, 'lightpink', 'lightpink');
		//Show winner
		if (scoreP1 === maxScore)
			drawText("Player 1 has won!", getFieldX() + 440, getFieldY() + 400, '64px serif');
		else
			drawText("Player 2 has won!", getFieldX() + 440, getFieldY() + 400, '64px serif');
		//Show score
		drawText(scoreP1.toString() + " - " + scoreP2.toString(), getFieldX() + 600, getFieldY() + 600, '48px serif');
		requestAnimationFrame(getWindowSize);
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
