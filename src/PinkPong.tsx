import React , {CSSProperties } from 'react';
import './PinkPong.css';

interface PinkPongState {
	field: number;
	paddleX: number;
	Opponent: number;
	ballX: number;
	ballY: number;
	ballVX: number;
	ballVY: number;
	fieldWidth: number;
	paddleWidth: number;
	paddleHeight: number;
	ballWidth: number;
	scorePlayerOne: number;
	scorePlayerTwo: number;
}

interface FieldProps {
	margin: number;
	width: number;
}
interface FieldState{}

interface PinkPongProps {}

interface BallProps {
	x: number;
	y: number;
	width: number;
}

interface PaddleProps {
	margin: number;
	width: number;
}

interface PaddleState {}

class Field extends React.Component<FieldProps, FieldState> {
	render() {
		const theStyle: CSSProperties = {position: 'absolute', left: this.props.margin + "px", top: "0px", width: this.props.width + "px"};
		return (
			<button className="field" style= {theStyle}/>
			);
		}
	}
class Paddle extends React.Component<PaddleProps, PaddleState> {
	render() {
		const theStyle: CSSProperties = {position: 'absolute', left: this.props.margin + "px", top: "0px", width: this.props.width + "px"};
		return (
			<button className="paddle" style= {theStyle}/>
			);
	}
}
class Opponent extends React.Component<PaddleProps, PaddleState> {
	render() {
		const theStyle: CSSProperties = {position: 'absolute', left: this.props.margin + "px", top: "0px", width: this.props.width + "px"};
		return (
			<button className="opponent" style= {theStyle}/>
			);
	}
}

class Ball extends React.Component<BallProps> {
	render () {
		const theStyle: CSSProperties = {position: 'absolute', left: this.props.x + "px", top: this.props.y + "px", width: this.props.width};
		return (
			<button className="ball" style ={theStyle}>
			</button>
		);
	}
}

interface ScoreProps {
	playerOneName: string;
	playerTwoName: string;
	playerOneScore: number;
	playerTwoScore: number;
}
class ScoreBoard extends React.Component<ScoreProps> {
	render () {
		return (
			<div className={"Score"}>
				<p className={"playerName"}>{this.props.playerOneName}</p>
				<p>{this.props.playerOneScore.toString()}</p>
				<p className={"playerName"}>{this.props.playerTwoName}</p>
				<p>{this.props.playerTwoScore.toString()}</p>
			</div>
		);
	}
}

class PinkPong extends React.Component<PinkPongProps, PinkPongState> {
	constructor(props: PinkPongProps) {
		super(props);
		this.state = {
			field: 100,
			paddleX: 450,
			Opponent: 450,
			ballX: 475,
			ballY: 475,
			ballVX: 0,
			ballVY: 3,
			fieldWidth: 800,
			paddleWidth: 100,
			paddleHeight: 50,
			ballWidth: 50,
			scorePlayerOne: 0,
			scorePlayerTwo: 0,
		};
	}
	handleKeyPress(event: KeyboardEvent) {
		if (event.key === "k") {
			if (this.state.paddleX < 800) {
				this.setState({paddleX: this.state.paddleX + 10});
			}
		}
		if (event.key === "j") {
			if (this.state.paddleX > 100) {
				this.setState({paddleX: this.state.paddleX - 10});
			}
		}
		if (event.key === "x") {
			if (this.state.Opponent < 800) {
				this.setState({Opponent: this.state.Opponent + 10});
			}
		}
		if (event.key === "z") {
			if (this.state.Opponent > 100) {
				this.setState({Opponent: this.state.Opponent - 10});
			}
		}
	}
	update() {
		/*	bounce top paddle */
		if (this.state.ballVY < 0 && this.state.ballY <= (100 + 34))
		{
			if (this.state.ballY < 100 - 50)
			{
				this.setState({scorePlayerOne: this.state.scorePlayerOne + 1});
				return this.reset();
			}
			else if (this.state.ballX + this.state.ballWidth > this.state.paddleX && this.state.ballX <= this.state.paddleX + this.state.paddleWidth)
			{
				this.setState({ballVY: this.state.ballVY * -1});
			}
		}
		/*	bounce bottom paddle */
		else if (this.state.ballVY > 0 && this.state.ballY >= (900 - 34 - 50))
		{
			if (this.state.ballY - 0 > 900)
			{
				this.setState({scorePlayerTwo: this.state.scorePlayerTwo + 1});
				return this.reset();
			}
			else if (this.state.ballX + this.state.ballWidth > this.state.Opponent && this.state.ballX <= this.state.Opponent + this.state.paddleWidth)
			{
				this.setState({ballVY: this.state.ballVY * -1});
			}
		}
		/*	bounce east wall */
		if (this.state.ballX + this.state.ballWidth > 900 && this.state.ballVX > 0)
		{
			this.setState({ballVX: this.state.ballVX * -1});
		}
		/*	bounce west wall */
		else if (this.state.ballX <= 100 && this.state.ballVX < 0)
		{
			this.setState({ballVX: this.state.ballVX * -1});
		}
		
		/*	calculate next position */
		this.setState({ballY: this.state.ballY + this.state.ballVY,
			ballX: this.state.ballX + this.state.ballVX});
	}
	reset () {
		this.setState(
			{

				ballY: 475,
				ballX: 475,
				ballVX: 0,
				ballVY: 3,
				paddleX: 450,
				Opponent: 450,
			}
		)
	}

	componentDidMount() {
		document.addEventListener("keydown", this.handleKeyPress.bind(this), false);
		setInterval(this.update.bind(this), 10);
	}
	componentWillUnmount(){
		document.removeEventListener("keydown", this.handleKeyPress, false);
	}
	render() {
		return (
            <header className="PinkPong-header">
			<div className="game">
			<div className="game-board">
			<Field
			margin={this.state.field}
			width={this.state.fieldWidth}
			/>
			<Paddle
			margin={this.state.paddleX}
			width={this.state.paddleWidth}
			/>
			<Opponent
			margin={this.state.Opponent}
			width={this.state.paddleWidth}
			/>
			<Ball
			x={this.state.ballX}
			y={this.state.ballY}
			width={this.state.ballWidth}
			/>
			<ScoreBoard
			playerOneName ={"Player1_TOP"}
			playerTwoName ={"Player2_BOTTOM"}
			playerOneScore ={this.state.scorePlayerOne}
			playerTwoScore ={this.state.scorePlayerTwo}
			/>
			</div>
			</div>
            </header>
		);
	}
}

export default PinkPong;