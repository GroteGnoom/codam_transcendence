import React, { useRef } from 'react';
import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import { pink } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { get_backend_host, userStatus } from './utils';
import { io } from 'socket.io-client';

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
		const li = fetch(get_backend_host() + "/auth/amiloggedin", {
			method: 'GET',
			credentials: 'include',
		}).then(response => response.json());
		this.setState({ li: await li });
	}
	render() {
		return (<div>"You are {this.getLiString()} logged in"</div>);
	}
}

interface HomeProps {
	statusWebsocket: any;
	setStatusWebsocket: any;
}

const Home = (props : HomeProps) => {
	const [li, setLi] = useState(false);
	const [uniqueSession, setUniqueSession] = useState(false);

	//backend calls
	async function getUniqueSession() {
		return await fetch(get_backend_host() + "/auth/uniqueSession", {
			method: "GET",
			credentials: 'include',
		}).then(response => response.json())
		.then((response) => {
            setUniqueSession(response);
		})
	}

	async function getLoggedIn() {
		return await fetch(get_backend_host() + "/auth/amiloggedin/", {
			method: "GET",
			credentials: 'include',
		})
		.then(async (response) => { // TODO: is this the right place?
			const json = await response.json();
			console.log(json)
			// if ( json && !props.statusWebsocket ){
			// 	console.log('Opening Status WebSocket');
			// 	props.setStatusWebsocket(io(get_backend_host() + "/status-ws", {
			// 		withCredentials: true,
			// 		path: "/status-ws/socket.io" 
			// 	}))
			// }
			setLi(json);
		});
	}

	async function signOutUser() {
		return await fetch(get_backend_host() + "/users/signoutuser", {
			method: "PUT",
			credentials: 'include',
		})
	}

	async function logOutUser() {
		// await fetch(get_backend_host() + "/auth/logout/", {
		// 	method: "GET",
		// 	credentials: 'include',
		// })
		// await fetch(get_backend_host() + "/users/signupuser", {
        //     method: "PUT",
        //     credentials: 'include',
        //     headers: {'Content-Type':'application/json'},
        //     body: JSON.stringify({
        //         "status": userStatus.Offline,
        //     })
        // })
	}

	// effect hooks
	// combination of componentDidMount and componentDidUpdate
	useEffect(() => { // will be called after the DOM update (after render)
		getLoggedIn();
	});

	useEffect(() => {
		getLoggedIn();
		getUniqueSession();
	}, []); // will only be called on initial mount and unmount


	return (
		<ThemeProvider theme={pinkTheme}>
			<main>
				{ uniqueSession ?
				null : <p>Pink Pong is already open in another browser</p> }
				<div className="App">
					<header className="App-header">
						<ShowLogin />
						<Link className="App-link" to={{ pathname: "/signup" }}><Button className="button" variant="contained">Log in / Sign up</Button></Link>
						<Link className={!li ? "disabledLink" : "App-link"} to= {{pathname:"/classicWaitingroom"}}><Button disabled={!li} className="button" variant="contained">Classic Pong</Button></Link>
                  		<Link className={!li ? "disabledLink" : "App-link"} to= {{pathname:"/PinkPongWaitingroom"}}><Button disabled={!li} className="button" variant="contained">Pink Pong</Button></Link>
						<Link className={!li ? "disabledLink" : "App-link"} to={{ pathname: "/chat" }}><Button disabled={!li} className="button" variant="contained">Chat</Button></Link>
						<Link className={!li ? "disabledLink" : "App-link"} to={{ pathname: "/account" }}><Button disabled={!li} className="button" variant="contained">My account</Button></Link>
						<Link className={!li ? "disabledLink" : "App-link"} to={{ pathname: "/leaderboard" }}><Button disabled={!li} className="button" variant="contained">Leaderboard</Button></Link>
						<Button disabled={!li} className="button" onClick={() => signOutUser()} variant="contained">Sign out</Button>
						<Button disabled={!li} className="button" onClick={() => logOutUser()} variant="contained">Log out</Button>
					</header>
				</div>
			</main>
		</ThemeProvider>
	)
}

export default Home
