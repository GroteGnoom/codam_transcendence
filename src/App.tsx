import React , {CSSProperties } from 'react';
import './App.css';

interface SquareProps {
	value: string;
	onClick: () => void;
}

interface BoardProps {
	squares: string[];
	onClick: (i: number) => void;
	margin: number;
}

interface BoardState {
}

interface GameProps {
}

interface BallProps {
	x: number;
	y: number;
}

class Ball extends React.Component<BallProps> {
	constructor(props: BallProps) {
		super(props);
	}
	render () {
		const thestyle: CSSProperties = {position: 'absolute', left: this.props.x + "px", top: this.props.y + "px"};
		return (
			<button className="ball" style ={thestyle}>
			</button>
		);
	}
}

interface GameState {
	xIsNext: boolean;
	history: string[][];
	stepNumber: number;
	keyPress: number;
	ballx: number;
	bally: number;
}


function Square(props: SquareProps) {
	return (
		<button className="square" onClick={() => { props.onClick()} } >
		{props.value} 
		</button>
	);
}

class Board extends React.Component<BoardProps, BoardState> {
	renderSquare(i: number) {
		return (
			<Square 
			value={this.props.squares[i]}
			onClick={() => this.props.onClick(i)}
			/>);
	}
	render() {
		const thestyle: CSSProperties = {position: 'absolute', left: this.props.margin + "px"};
		return (
			<div>
			<div style = {thestyle}>
			{this.renderSquare(0)}
			{this.renderSquare(1)}
			{this.renderSquare(2)}
			</div>
			</div>
		);
	}
}

class Game extends React.Component<GameProps, GameState> {
	constructor(props: GameProps) {
		super(props);
		this.state = {
			history: [
					Array(9).fill('')
			],
			stepNumber: 0,
			xIsNext: true,
			keyPress: 0,
			ballx: 100,
			bally: 300,
		};
	}
	handleClick(i: number) {
		const history = this.state.history.slice(0, this.state.stepNumber + 1);
		const current = history[history.length - 1];
		const squares = current.slice();
		if (calculateWinner(squares) || squares[i]) {
			return;
		}
		squares[i] = this.state.xIsNext ? "X" : "O";
		this.setState({
			history: history.concat([
					squares
			]),
			stepNumber: history.length,
			xIsNext: !this.state.xIsNext
		});
	}

	handleKeyPress(event: KeyboardEvent) {
		if (event.key === "k") {
			if (this.state.keyPress < 500) {
				this.setState({keyPress: this.state.keyPress + 10});
			}
		}
		if (event.key === "j") {
			if (this.state.keyPress > 0) {
				this.setState({keyPress: this.state.keyPress - 10});
			}
		}
	}
	jumpTo(step: number) {
		this.setState({
			stepNumber: step,
			xIsNext: (step % 2) === 0
		});
	}
	doThing() {
		this.setState({bally: this.state.bally - 10});
	}
	componentDidMount() {
		document.addEventListener("keydown", this.handleKeyPress.bind(this), false);
	}
	componentWillUnmount(){
		document.removeEventListener("keydown", this.handleKeyPress, false);
	}
	render() {
		setInterval(this.doThing.bind(this), 1000);
		const history = this.state.history;
		const current = history[this.state.stepNumber];
		const winner = calculateWinner(current);

		const moves = history.map((step, move) => {
			const desc = move ?
				'Go to move #' + move :
				'Go to game start';
			return (
				<li key={move}>
				<button onClick={() => this.jumpTo(move)}>{desc}</button>
				</li>
			);
		});

		let status;
		if (winner) {
			status = "Winner: " + winner;
		} else {
			status = "Next player: " + (this.state.xIsNext ? "X" : "O");
		}
		return (
			<div className="game">
			<div className="game-board">
			<Ball
			x={this.state.ballx}
			y={this.state.bally}
			/>
			<Board
			squares={current}
			onClick={i => this.handleClick(i)}
			margin={this.state.keyPress}
			/>
			</div>
			<div className="game-info">
			<div>{status}</div>
			<ol>{moves}</ol>
			</div>
			</div>
		);
	}
}

function App() {
	return (
		<Game />
	)
}

function calculateWinner(squares: string[]) {
	const lines = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	];
	for (let i = 0; i < lines.length; i++) {
		const [a, b, c] = lines[i];
		if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
			return squares[a];
		}
	}
	return null;
}

export default App;
