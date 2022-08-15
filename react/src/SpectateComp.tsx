import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import { useEffect, useRef } from 'react';
import { get_backend_host } from './utils';
import {CircularProgress, Typography} from '@mui/material';
import { PlaylistAddOutlined } from '@mui/icons-material';
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';

// const pinkTheme = createTheme({ palette: { primary: pink } })

interface SpectateProps {
}

interface SpectateState {
	webSocket: any;
	games: any[];
	gamesArray: Array<any>;
}

class SpectateComp extends React.Component <SpectateProps, SpectateState> {
	constructor(props: SpectateProps) {
		super(props);
		this.state = {
			games: [],
			webSocket: {},
			gamesArray: [],
		}
		//this.state.webSocket = useRef(null); // useRef creates an object with a 'current' property
		console.log('Opening spectate WebSocket');
		this.state.webSocket.current = io(get_backend_host() + "/match-ws", {
			withCredentials: true,
			path: "/match-ws/socket.io"
		});
		console.log('spectate subscribe to matchid');
		this.state.webSocket.current.on("matches", this.listGames.bind(this) )
		this.state.webSocket.current.emit("getGames", {});
	}

	listGames(payload: any) {
		console.log("listGames");
		console.log("payload:", payload);
		this.setState({games: payload}, function(this: any) {
			console.log("after state set:", this.state.games)
			this.setState({gamesArray: Array.from(this.state.games)});
		});
		console.log("state.games", this.state.games);
		console.log("state.games length", this.state.games.length);
		if (this.state.games.length > 0) {
			this.setState({gamesArray: Array.from(this.state.games)});
			this.state.gamesArray.map((game) => {
				console.log('game:', game);
			});
		}
	}

	render () {
		return (
			<main>
			<div className="menu">
			<Typography variant="h3" color="primary">
			Searching for games...
					</Typography>
				{this.state.gamesArray.map((game) => (
					<Link className={"App-link"} key={game.matchID} to={{ pathname: "/pinkpong/" + game.matchID}}><Button className="button" variant="contained">{game.userName1} --- {game.userName2} </Button></Link>
				))}
			</div>
			</main>
		)
	}
}

export default SpectateComp;
