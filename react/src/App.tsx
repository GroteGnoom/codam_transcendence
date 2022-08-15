import { pink } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { Route, Routes } from "react-router-dom";
import { Account } from './account/Account';
import UserInfo from './account/UserInfo';
import './App.css';
import Chat from './Chat/Chat';
import ClassicWaitingRoom from './classicWaitingRoom';
import Home from './Home';
import PinkPong from './PinkPong';
import PinkPongWaitingRoom from './PinkPongWaitingRoom';
import InviteWaitingRoomClassic from './inviteWaitingRoomClassic';
import InviteWaitingRoomPinkPong from './inviteWaitingRoomPinkPong';
import QR from './QR';
import { Signup } from './Signup';
import { get_backend_host, userStatus } from './utils';
import { io } from 'socket.io-client';
import Leaderboard from './account/Leaderboard';
import Spectate from './Spectate';

const pinkTheme = createTheme({ palette: { primary: pink } })


function App() {
	// const statusWebSocket: any = useRef(null); // useRef creates an object with a 'current' property
	const [statusWebSocket, setStatusWebsocket] = useState(null);

	useEffect(() => {
		if (!statusWebSocket) {
			console.log("Opening status websocket")
			const socket = io(get_backend_host() + "/status-ws", {
				withCredentials: true,
				path: "/status-ws/socket.io" 
			})
			setStatusWebsocket(socket as any)
		}
	}, []);

	return (
		<ThemeProvider theme={pinkTheme}>
		 	Status websocket connected: {statusWebSocket ? "YES": "NO"}
			<Routes>
				<Route path={"/"} element={<Home statusWebsocket={statusWebSocket} setStatusWebsocket={setStatusWebsocket}/>} />
				<Route path={"/pinkpong"} element={<PinkPong />} />
				<Route path={"/pinkpong/:spectateMatchID"} element={<PinkPong />} />
				<Route path={"/classicWaitingroom"} element={<ClassicWaitingRoom />} />
				<Route path={"/inviteWaitingroomClassic"} element={<InviteWaitingRoomClassic />} />
				<Route path={"/inviteWaitingroomPinkPong"} element={<InviteWaitingRoomPinkPong />} />
				<Route path={"/PinkPongWaitingroom"} element={<PinkPongWaitingRoom />} />
				<Route path={"/Spectate"} element={<Spectate />} />
				<Route path={"/chat"} element={<Chat />} />
				<Route path={"/account"} element={<Account />} />
				<Route path={"/signup"} element={<Signup />} />
				<Route path={"/userinfo/:id"} element={<UserInfo statusWebsocket={statusWebSocket}/>} />
				<Route path={"/leaderboard"} element={<Leaderboard />} />
			</Routes>
		</ThemeProvider>
	);
}

export default App;
