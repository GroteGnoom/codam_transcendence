import React from 'react';
import logo from './logo.svg';
import './App.css';

interface SquareProps {
	value: string;
	onClick: () => void;
}

function Square(props: SquareProps) {
	return (
		<button className="square" onClick={() => { props.onClick()} } >
		{props.value} 
		</button>
	);
}

interface BoardProps {}
interface BoardState {
	squares: string[];
	xIsNext: boolean;
}

class Board extends React.Component<BoardProps, BoardState> {
	constructor(props:BoardProps) {
		super(props);
		this.state = {
			squares: Array(9).fill(''),
			xIsNext: true,
		};
	}
	renderSquare(i: number) {
		return (
			<Square 
			value={this.state.squares[i]}
			onClick={() => this.handleClick(i)}
			/>);
	}
	handleClick(i: number) {
		const squares = this.state.squares.slice();
		if (calculateWinner(squares) || squares[i]) {      return;    }
		squares[i] = this.state.xIsNext ? 'X' : 'O';
		this.setState({squares: squares});
		this.setState({xIsNext: !this.state.xIsNext});
	}
	render() {
		const winner = calculateWinner(this.state.squares);
		let status;
		if (winner) {
			status = 'Winner: ' + winner;
		} else {
			status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
		}
		return (
			<div className="App">
			<header className="App-header">
			<img src={logo} className="App-logo" alt="logo" />
			{status}
			<div>
			{this.renderSquare(0)}
			{this.renderSquare(1)}
			{this.renderSquare(2)}
			</div>
			<div>
			{this.renderSquare(3)}
			{this.renderSquare(4)}
			{this.renderSquare(5)}
			</div>
			<div>
			{this.renderSquare(6)}
			{this.renderSquare(7)}
			{this.renderSquare(8)}
			</div>
			</header>
			</div>
		);
	}
}

function App() {
	return (
		<Board />
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
