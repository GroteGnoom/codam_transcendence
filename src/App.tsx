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
		squares[i] = this.state.xIsNext ? 'X' : 'O';
		this.setState({squares: squares});
		this.setState({xIsNext: !this.state.xIsNext});
	}
	render() {
		return (
			<div className="App">
			<header className="App-header">
			<img src={logo} className="App-logo" alt="logo" />
			next: {this.state.xIsNext ? 'X' : 'O'}
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

export default App;
