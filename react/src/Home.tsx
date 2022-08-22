import { Alert, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import Button from '@mui/material/Button';
import { pink } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { get_backend_host } from './utils';

const pinkTheme = createTheme({ palette: { primary: pink } })

interface HomeProps {
	statusWebsocket: any;
	setStatusWebsocket: any;
}

let achievement = "";

const Home = (props: HomeProps) => {
	const [li, setLi] = useState(false);
	let navigate = useNavigate();
	let player = -1;

	const webSocket: any = useRef(null); // useRef creates an object with a 'current' property

	async function setAchievementEvent(payload: any) {
		if (player === -1) {
			await fetch(get_backend_host() + `/users/user`, {
				method: 'GET',
				credentials: 'include',
			}).then((response) => response.json())
				.then((response) => { player = response.id })
		}
		if (player === payload.user)
			achievement = payload.achievement;
		console.log("achievement: ", payload.achievement);
	}

	function resetAchievement() {
		achievement = "";
		navigate("/", { replace: true });
	}

	if (webSocket.current)
		webSocket.current.on("achievement", setAchievementEvent) // subscribe on backend events

	async function getLoggedIn() {
		return await fetch(get_backend_host() + "/auth/amiloggedin/", {
			method: "GET",
			credentials: 'include',
		})
			.then(async (response) => {
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

	// effect hooks
	// combination of componentDidMount and componentDidUpdate
	useEffect(() => { // will be called after the DOM update (after render)
		getLoggedIn();
	});

	useEffect(() => {
		webSocket.current = io(get_backend_host() + "/match-ws", {
			withCredentials: true,
			path: "/match-ws/socket.io"
		}); // open websocket connection with backend

		getLoggedIn();
	}, []); // will only be called on initial mount and unmount


	return (
		<ThemeProvider theme={pinkTheme}>
			<main>
				<div className="App">
					<header className="App-header">
						<Link className="App-link" to={{ pathname: "/signup" }}><Button className="button" variant="contained">Log in / Sign up</Button></Link>
						<Link className={!li ? "disabledLink" : "App-link"} to={{ pathname: "/classicWaitingroom" }}><Button disabled={!li} className="button" variant="contained">Classic Pong</Button></Link>
						<Link className={!li ? "disabledLink" : "App-link"} to={{ pathname: "/PinkPongWaitingroom" }}><Button disabled={!li} className="button" variant="contained">Pink Pong</Button></Link>
						<Link className={!li ? "disabledLink" : "App-link"} to={{ pathname: "/chat" }}><Button disabled={!li} className="button" variant="contained">Chat</Button></Link>
						<Link className={!li ? "disabledLink" : "App-link"} to={{ pathname: "/spectate" }}><Button disabled={!li} className="button" variant="contained">Spectate</Button></Link>
						<Link className={!li ? "disabledLink" : "App-link"} to={{ pathname: "/account" }}><Button disabled={!li} className="button" variant="contained">My account</Button></Link>
						<Link className={!li ? "disabledLink" : "App-link"} to={{ pathname: "/leaderboard" }}><Button disabled={!li} className="button" variant="contained">Leaderboard</Button></Link>
					</header>
				</div>
			</main>

			<Dialog open={achievement !== ""} >  {/*pop window for new achievement message */}
				<DialogTitle>Achievement Unlocked!</DialogTitle>
				<DialogContent>
					<Alert severity="success">
						{achievement}
					</Alert>
				</DialogContent>
				<DialogActions>
					<Button variant="contained" onClick={() => resetAchievement()}>OK</Button>
				</DialogActions>
			</Dialog>
		</ThemeProvider>
	)
}

export default Home
