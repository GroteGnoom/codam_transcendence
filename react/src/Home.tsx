import React from 'react';
import {Link} from 'react-router-dom';
import Button from '@mui/material/Button';
import { pink } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const pinkTheme = createTheme({ palette: { primary: pink } })

interface LoginState {
	li: boolean;
	lis: any;
}

class ShowLogin extends React.Component<LoginState> {
	constructor() {
		super();
		this.state = {
			li: false,
		}
	}
	getBla() {
		if (!this.state.li)
			return "not";
		return "";
	}
	async componentDidMount() {
		const li =  fetch("http://127.0.0.1:5000/auth/amiloggedin", { 
			method: 'GET',
			credentials: 'include',
			//mode: 'no-cors',
		}).then(response => response.json());
		const bla = await li;
		console.log("bla:", bla); 
		console.log("li:", li); 
		console.log("lis:", this.state.lis); 
		this.setState({li: bla});
		this.setState({lis: bla});
	}
	render() {
		return (<div>"You are {this.getBla()} logged in"</div>);
		//return (<div>"You are" + {this.getLi()} + "logged in"</div>);
		//return (<div>"You are logged in"</div>);
	}
}

const Home = () =>
{
	return (
            <ThemeProvider theme={pinkTheme}>
		<main>
            <div className="App">
            <header className="App-header">
                  <ShowLogin/>
                  <Link to= {{pathname:"/login"}}><Button variant="contained">Login</Button></Link>
                  <Link to= {{pathname:"/pinkpong"}}><Button variant="contained">PinkPong</Button></Link>
                  <Link to= {{pathname:"/chat"}}><Button variant="contained">Chat</Button></Link>
                  <Link to= {{pathname:"/account"}}><Button variant="contained">My account</Button></Link>
				  <a href="http://127.0.0.1:5000/auth/ft">Log in</a>
            </header>
            </div>
		</main>
            </ThemeProvider>
	)
}

export default Home
