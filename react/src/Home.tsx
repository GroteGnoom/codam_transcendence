import React from 'react';
import { useState, useEffect } from "react";
import {Link} from 'react-router-dom';
import Button from '@mui/material/Button';
import { pink } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { get_backend_host } from './utils';

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
		console.log("hostname:", window.location.hostname);
		console.log("uri:", window.location.hostname + ":5000/auth/amiloggedin");
		//const li =  fetch("http://" + window.location.hostname + ":5000/auth/amiloggedin", { 
		const li =  fetch(get_backend_host() + "/auth/amiloggedin", { 
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
	const [li, setLi] = useState(false);

	// effect hooks
    // combination of componentDidMount and componentDidUpdate
    useEffect(() => { // will be called after the DOM update (after render)
        getLoggedIn();
    });

    useEffect(() => {
        getLoggedIn();
    }, []); // will only be called on initial mount and unmount
	
	async function getLoggedIn () {
        return await fetch(get_backend_host() + "/auth/amiloggedin/", { 
            method: "GET",
            credentials: 'include',
        })
        .then(async (response) => {
            const json = await response.json();
            setLi(json);
        });
    }

	return (
        <ThemeProvider theme={pinkTheme}>
		<main>
            <div className="App">
            <header className="App-header">
                  <ShowLogin/>
                  <Link to= {{pathname:"/signup"}}><Button className="button" variant="contained">Log in / Sign up</Button></Link>
                  {/* <Link to= {{pathname:"/check_2fa"}}><Button className="button" variant="contained">Check 2fa</Button></Link> */}
                  {/* <Link to= {{pathname:"/show_qr"}}><Button className="button" variant="contained">Enable 2fa</Button></Link> */}
                  <Link to= {{pathname:"/waitingroom"}}><Button disabled={!li} className="button" variant="contained">PinkPong</Button></Link>
                  <Link to= {{pathname:"/chat"}}><Button disabled={!li} className="button" variant="contained">Chat</Button></Link>
                  <Link to= {{pathname:"/account"}}><Button disabled={!li} className="button" variant="contained">My account</Button></Link>
            </header>
            </div>
		</main>
            </ThemeProvider>
	)
}

export default Home
