import React , {CSSProperties } from 'react';
import './PinkPong.css';

interface PinkPongState {
	paddleX: number;
	ballX: number;
	ballY: number;
	ballVX: number;
	ballVY: number;
	paddleWidth: number;
	ballWidth: number;
}

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

interface PaddleState {
}

class Paddle extends React.Component<PaddleProps, PaddleState> {
	render() {
		const theStyle: CSSProperties = {position: 'absolute', left: this.props.margin + "px", top: "0px", width: this.props.width + "px"};
		return (
			<button className="paddle" style= {theStyle}/>
		);
	}
}

class Ball extends React.Component<BallProps> {
	render () {
		const thestyle: CSSProperties = {position: 'absolute', left: this.props.x + "px", top: this.props.y + "px", width: this.props.width};
		return (
			<button className="ball" style ={thestyle}>
			</button>
		);
	}
}

class PinkPong extends React.Component<PinkPongProps, PinkPongState> {
	constructor(props: PinkPongProps) {
		super(props);
		this.state = {
			paddleX: 0,
			ballX: 100,
			ballY: 300,
			ballVX: 3,
			ballVY: -30,
			paddleWidth: 150,
			ballWidth: 50,
		};
	}
	handleKeyPress(event: KeyboardEvent) {
		if (event.key === "k") {
			if (this.state.paddleX < 500) {
				this.setState({paddleX: this.state.paddleX + 10});
			}
		}
		if (event.key === "j") {
			if (this.state.paddleX > 0) {
				this.setState({paddleX: this.state.paddleX - 10});
			}
		}
	}
	update() {
		if ((this.state.ballY < 84 && this.state.ballY > -10) && this.state.ballVY < 0) {
			if (this.state.ballX + this.state.ballWidth > this.state.paddleX && this.state.ballX < this.state.paddleX + this.state.paddleWidth)
				this.setState({ballVY: this.state.ballVY * -1});
		}
		if (this.state.ballY > 300 && this.state.ballVY > 0) {
			this.setState({ballVY: this.state.ballVY * -1});
		}
		this.setState({ballY: this.state.ballY + this.state.ballVY,
					  ballX: this.state.ballX + this.state.ballVX
		});
	}
	componentDidMount() {
		document.addEventListener("keydown", this.handleKeyPress.bind(this), false);
		setInterval(this.update.bind(this), 100);
	}
	componentWillUnmount(){
		document.removeEventListener("keydown", this.handleKeyPress, false);
	}
	render() {
		return (
            <header className="PinkPong-header">
			<div className="game">
			<div className="game-board">
			<Ball
			x={this.state.ballX}
			y={this.state.ballY}
			width={this.state.ballWidth}
			/>
			<Paddle
			margin={this.state.paddleX}
			width={this.state.paddleWidth}
			/>
			</div>
			</div>
            </header>
		);
	}
}

export default PinkPong;