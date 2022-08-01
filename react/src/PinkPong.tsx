import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";

export default function PinkPong() {
	let fieldWidth: number = 1500;		//3
	let fieldHeight: number = 1000;		//2
	let paddleWidth = 100;
	let paddleHeight = 15;
	let ballWidth = 25;
	
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let textSize: number = 48;
	
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

	/*	powerups */
	let paddleSizeMultiplierP1: number = 1;
    let paddleSizeMultiplierP2: number = 1;

	const webSocket: any = useRef(null); // useRef creates an object with a 'current' property
	let navigate = useNavigate();
	
	useEffect(() => {
		// eslint-disable-next-line react-hooks/exhaustive-deps
		canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
		if (!canvas)
			console.log("error");
			// eslint-disable-next-line react-hooks/exhaustive-deps
			ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
			if (!ctx)
				console.log("error");
		
		componentDidMount();
		// eslint-disable-next-line react-hooks/exhaustive-deps
		setTimeOut = false;
		
		console.log('Opening WebSocket');
		webSocket.current = io('http://127.0.0.1:5000', {withCredentials: true, 
							   extraHeaders: 
							   {"extraheader":"extra", 
								Cookie: "name=value; name2=value2",
								Definitely_not_a_cookie: "name=value; name2=value2",
	   	}}); // open websocket connection with backend
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

		webSocket.current.emit("keyPressed", {
			"leftKeyPressedP1": leftKeyPressedP1,
			"rightKeyPressedP1": rightKeyPressedP1,
			"leftKeyPressedP2": leftKeyPressedP2,
			"rightKeyPressedP2": rightKeyPressedP2,
			"reset": false
		})
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
		canvas.width = window.innerWidth - getScrollbarWidth();
		canvas.height = window.innerHeight;

		if (canvas.width / 3 * 2 < canvas.height)
		{
			fieldWidth = canvas.width * 0.9;
			fieldHeight = fieldWidth / 3 * 2;
		}
		else
		{
			fieldHeight = canvas.height * 0.9;
			fieldWidth = fieldHeight * 1.5;
		}
		paddleWidth = 100 * (fieldWidth / 1500);
		ballWidth = 25 * (fieldWidth / 1500);
		paddleHeight = 15 * (fieldHeight / 1000);

		if (payload.winner !== 0 && payload.winner !== -1) {
			console.log("EndGame");
			EndGame(payload.winner, payload.scoreP1, payload.scoreP2);
		}
		else if (payload.winner === 0) {
			ballX = getFieldX() + payload.ballRelX * (fieldWidth / 1500);
			ballY = getFieldY() + payload.ballRelY * (fieldHeight / 1000);
			paddleP1X = getFieldX() + payload.paddleP1RelX * (fieldWidth / 1500);
			paddleP1Y = getFieldY() + payload.paddleP1RelY * (fieldHeight / 1000);
			paddleP2X = getFieldX() + payload.paddleP2RelX * (fieldWidth / 1500);
			paddleP2Y = getFieldY() + payload.paddleP2RelY * (fieldHeight / 1000);
			paddleSizeMultiplierP1 = payload.paddleSizeMultiplierP1;
			paddleSizeMultiplierP2 = payload.paddleSizeMultiplierP2;
			draw(ballX, ballY, paddleP1X, paddleP1Y, paddleP2X, paddleP2Y, payload.scoreP1, payload.scoreP2);
		}
	}

	function getScrollbarWidth() {
		return window.innerWidth - document.documentElement.clientWidth;
	}

	function draw(ballX: number, ballY: number, paddleP1X: number, paddleP1Y: number, paddleP2X: number, paddleP2Y: number, scoreP1: number, scoreP2: number){
		document.body.style.overflow = "hidden";
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		textSize = 48 * (fieldHeight / 1000);
		//background
		drawRectangle(0, 0, canvas.width, canvas.height, 'lightpink', 'lightpink');
		//field
		drawRectangle(getFieldX(), getFieldY(), fieldWidth, fieldHeight, 'pink', 'darkpink');
		//score P1
		drawText(scoreP1.toString(), getFieldX() + fieldWidth / 2, getFieldY() + fieldHeight / 3, textSize.toString() + 'px serif');
		//score P2
		drawText(scoreP2.toString(), getFieldX() + fieldWidth / 2, getFieldY() + (fieldHeight / 3) * 2, textSize.toString() + 'px serif');
		//paddle P1
		drawRectangle(paddleP1X, paddleP1Y, (paddleWidth * paddleSizeMultiplierP1), paddleHeight, 'black', 'yellow');
		//paddle P2
		drawRectangle(paddleP2X, paddleP2Y, (paddleWidth * paddleSizeMultiplierP2), paddleHeight, 'white', 'yellow');
		//ball
		drawRectangle(ballX, ballY, ballWidth, ballWidth, 'blue', 'yellow');
	}

	function getFieldX() {
		return (canvas.width / 2 - fieldWidth / 2);
	}
	
	function getFieldY() {
		return (canvas.height / 2 - fieldHeight / 2);
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

	async function delay(ms: number) {
		await new Promise(resolve => setTimeout(()=>resolve(ms), ms)).then(()=>console.log("waited"));
	}

	function EndGame (winner: number, scoreP1: number, scoreP2: number) {
		getWindowSize(winner, scoreP1, scoreP2);
		if (setTimeOut === false) {
			setTimeOut = true;
			setTimeout(() => {
				webSocket.current.emit("keyPressed", {
				"leftKeyPressedP1": leftKeyPressedP1,
				"rightKeyPressedP1": rightKeyPressedP1,
				"leftKeyPressedP2": leftKeyPressedP2,
				"rightKeyPressedP2": rightKeyPressedP2,
				"reset": true
				})
				delay(100);
				console.log('Closing WebSocket EndGame');
				webSocket.current.close();
				navigate("/", { replace: true });}, 3000); //Reroute to home page after 5 seconds
		}
	}

	function getWindowSize(winner: number, scoreP1: number, scoreP2: number) {
		canvas.width = window.innerWidth - getScrollbarWidth();
		canvas.height = window.innerHeight;
		document.body.style.overflow = "hidden";
		drawEndScreen(winner, scoreP1, scoreP2);
	}

	function drawEndScreen(winner: number, scoreP1: number, scoreP2: number) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		
		textSize = 48 * (fieldHeight / 1000);
		let textSizeLarge: number = 64 * (fieldHeight / 1000);

		//background
		drawRectangle(0, 0, canvas.width, canvas.height, 'lightpink', 'lightpink');
		//Show winner
		if (winner === 1)
			drawText("Player 1 has won!", getFieldX() + 440 * (fieldWidth / 1500), getFieldY() + 400 * (fieldHeight / 1000), textSizeLarge.toString() + 'px serif');
		else
			drawText("Player 2 has won!", getFieldX() + 440 * (fieldWidth / 1500), getFieldY() + 400 * (fieldHeight / 1000), textSizeLarge.toString() + 'px serif');
		//Show score
		drawText(scoreP1.toString() + " - " + scoreP2.toString(), getFieldX() + 600 * (fieldWidth / 1500), getFieldY() + 600 * (fieldHeight / 1000), textSize.toString() + 'px serif');
	}
	
	return (
		<div>
			<canvas
			id="myCanvas"
			>
			Your browser does not support the HTML canvas tag.
			</canvas>
		</div>
	)
}
