import React from 'react';
import logo from './logo.svg';
import './App.css';

interface SquareProps {
	value: number;
}

class Square extends React.Component<SquareProps> {
	constructor(props: SquareProps) {
		super(props);
		this.state = {value: null};
	}
	render() {
		return (
				//<button className="square" onClick={function() { console.log('click'); }} >
				<button className="square" onClick={() => { console.log('click'); }} >
				{this.props.value} 
				{/* TODO */}
				</button>
			   );
	}
}

function renderSquare(i: number) {
	return <Square value={i}/>;
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
		<div>
		{renderSquare(0)}
		{renderSquare(1)}
		{renderSquare(2)}
		</div>
		<div>
		{renderSquare(3)}
		{renderSquare(4)}
		{renderSquare(5)}
		</div>
		<div>
		{renderSquare(6)}
		{renderSquare(7)}
		{renderSquare(8)}
		</div>
      </header>
    </div>
  );
}

export default App;
