import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";

export default function PinkPong() {
	const fieldWidth = 1500;
	const fieldHeight = 1000;
	const paddleWidth = 100;
	const paddleHeight = 25;
	const ballWidth = 25;
	
	let canvas: any;
	let ctx: any;
	
	let paddleP1X: number;
	let paddleP1Y: number;
	let paddleP2X: number;
	let paddleP2Y: number;
	
	let ballX: number;
	let ballY: number;
	
	let leftKeyPressedP1: boolean;
	let rightKeyPressedP1: boolean;
	let leftKeyPressedP2: boolean;
	let rightKeyPressedP2: boolean;

	let setTimeOut: boolean;

	const webSocket: any = useRef(null); // useRef creates an object with a 'current' property
	let navigate = useNavigate();

	useEffect(() => {
		// eslint-disable-next-line react-hooks/exhaustive-deps
		canvas = document.getElementById("myCanvas");
		if (!canvas)
			console.log("error");
		// eslint-disable-next-line react-hooks/exhaustive-deps
		ctx = canvas.getContext("2d");
		
		componentDidMount();
		// eslint-disable-next-line react-hooks/exhaustive-deps
		setTimeOut = false;
		
		console.log('Opening WebSocket');
		webSocket.current = io('ws://localhost:5000'); // open websocket connection with backend
		webSocket.current.emit("keyPressed", {
			"leftKeyPressedP1": false,
			"rightKeyPressedP1": false,
			"leftKeyPressedP2": false,
			"rightKeyPressedP2": false,
			"reset": false
		})
		webSocket.current.on("boardUpdated", getCoordinates ) // subscribe on backend events

		return () => {
			console.log('Closing WebSocket');
			webSocket.current.close();
		}
	}, []);
	
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
		webSocket.current.emit("keyPressed", {
			"leftKeyPressedP1": leftKeyPressedP1,
			"rightKeyPressedP1": rightKeyPressedP1,
			"leftKeyPressedP2": leftKeyPressedP2,
			"rightKeyPressedP2": rightKeyPressedP2,
			"reset": false
		})
	}
	
	function getCoordinates(payload: any) {
		if (payload.winner !== 0 && payload.winner !== -1) {
			EndGame(payload.winner, payload.scoreP1, payload.scoreP2);
		}
		else if (payload.winner === 0) {
			ballX = getFieldX() + payload.ballRelX;
			ballY = getFieldY() + payload.ballRelY;
			paddleP1X = getFieldX() + payload.paddleP1RelX;
			paddleP1Y = getFieldY() + payload.paddleP1RelY;
			paddleP2X = getFieldX() + payload.paddleP2RelX;
			paddleP2Y = getFieldY() + payload.paddleP2RelY;
			draw(ballX, ballY, paddleP1X, paddleP1Y, paddleP2X, paddleP2Y, payload.scoreP1, payload.scoreP2);
		}
	}
	
	function draw(ballX: number, ballY: number, paddleP1X: number, paddleP1Y: number, paddleP2X: number, paddleP2Y: number, scoreP1: number, scoreP2: number){
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		
		ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
		
		//background
		drawRectangle(0, 0, window.innerWidth, window.innerHeight, 'lightpink', 'lightpink');
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

		webSocket.current.emit("keyPressed", {
			"leftKeyPressedP1": leftKeyPressedP1,
			"rightKeyPressedP1": rightKeyPressedP1,
			"leftKeyPressedP2": leftKeyPressedP2,
			"rightKeyPressedP2": rightKeyPressedP2,
			"reset": false
		})
	}
		
	function getFieldX() {
		return (window.innerWidth / 2 - fieldWidth / 2);
	}
	
	function getFieldY() {
		return (window.innerHeight / 2 - fieldHeight / 2);
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

	function EndGame (winner: number, scoreP1: number, scoreP2: number) {
		let stopReset = false;
		if (setTimeOut === false) {
			setTimeOut = true;
			setTimeout(() => {
				stopReset = true;
				webSocket.current.emit("keyPressed", {
					"leftKeyPressedP1": leftKeyPressedP1,
					"rightKeyPressedP1": rightKeyPressedP1,
					"leftKeyPressedP2": leftKeyPressedP2,
					"rightKeyPressedP2": rightKeyPressedP2,
					"reset": true
				})
				console.log('Closing WebSocket EndGame');
				webSocket.current.close();
				navigate("/", { replace: true });
				}, 5000); //Reroute to home page after 5 seconds
			}
		if (stopReset === false) {
			getWindowSize(winner, scoreP1, scoreP2);
			webSocket.current.emit("keyPressed", {
				"leftKeyPressedP1": leftKeyPressedP1,
				"rightKeyPressedP1": rightKeyPressedP1,
				"leftKeyPressedP2": leftKeyPressedP2,
				"rightKeyPressedP2": rightKeyPressedP2,
				"reset": false
				})
		}
	};

	function getWindowSize(winner: number, scoreP1: number, scoreP2: number) {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		drawEndScreen(winner, scoreP1, scoreP2);
	}

	function drawEndScreen(winner: number, scoreP1: number, scoreP2: number) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		//background
		drawRectangle(0, 0, canvas.width, canvas.height, 'lightpink', 'lightpink');
		//Show winner
		if (winner === 1)
			drawText("Player 1 has won!", getFieldX() + 440, getFieldY() + 400, '64px serif');
		else
			drawText("Player 2 has won!", getFieldX() + 440, getFieldY() + 400, '64px serif');
		//Show score
		drawText(scoreP1.toString() + " - " + scoreP2.toString(), getFieldX() + 600, getFieldY() + 600, '48px serif');
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
