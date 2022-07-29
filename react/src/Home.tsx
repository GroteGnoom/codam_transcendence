import React from 'react';
import {Link} from 'react-router-dom';
import Button from '@mui/material/Button';
import { pink } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const pinkTheme = createTheme({ palette: { primary: pink } })

interface LoginState {
	li: boolean;
}

interface LoginProps {
}
class ShowLogin extends React.Component<LoginProps, LoginState> {
	constructor(props: LoginProps) {
		super(props);
		this.state = {
			li: false,
		}
	}
	getLiString() {
		if (!this.state.li)
			return "not";
		return "";
	}
	async componentDidMount() {
		const li =  fetch("http://127.0.0.1:5000/auth/amiloggedin", { 
			method: 'GET',
			credentials: 'include',
		}).then(response => response.json());
		this.setState({li: await li});
	}
	render() {
		return (<div>"You are {this.getLiString()} logged in"</div>);
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
                  <Link to= {{pathname:"/check_2fa"}}><Button className="button" variant="contained">Check 2fa</Button></Link>
                  <Link to= {{pathname:"/show_qr"}}><Button className="button" variant="contained">Enable 2fa</Button></Link>
                  <Link to= {{pathname:"/waitingroom"}}><Button className="button" variant="contained">PinkPong</Button></Link>
                  <Link to= {{pathname:"/chat"}}><Button className="button" variant="contained">Chat</Button></Link>
                  <Link to= {{pathname:"/account"}}><Button className="button" variant="contained">My account</Button></Link>
				  <a href="http://127.0.0.1:5000/auth/ft"><Button className="button" variant="contained">Log in</Button></a>
            </header>
            </div>
		</main>
            </ThemeProvider>
	)
}

export default Home
