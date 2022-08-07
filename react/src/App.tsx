import './App.css';
import { Routes, Route } from "react-router-dom";
import Home from './Home';
import QR from './QR';
import CheckTfa from './CheckTfa';
import PinkPong from './PinkPong';
import Chat from './Chat/Chat';
import Account from './account/Account';
import LoggedIn from './LoggedIn';
import { Signup } from './Signup';
import ClassicWaitingRoom from './classicWaitingRoom';
import PinkPongWaitingRoom from './PinkPongWaitingRoom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { pink } from '@mui/material/colors';
import UserInfo from './account/UserInfo';
import { useRef, useState } from 'react';

const pinkTheme = createTheme({ palette: { primary: pink } })


function App() {
	// const statusWebSocket: any = useRef(null); // useRef creates an object with a 'current' property
	const [statusWebSocket, setStatusWebsocket] = useState(null);

	return (
		<ThemeProvider theme={pinkTheme}>
		 	Status websocket connected: {statusWebSocket ? "YES": "NO"}
			<Routes>
				{/* <Route path={"/"} element={<Home statusWebsocket={statusWebSocket}/>} /> */}
				<Route path={"/"} element={<Home statusWebsocket={statusWebSocket} setStatusWebsocket={setStatusWebsocket}/>} />
				<Route path={"/check_2fa"} element={<CheckTfa />} />
				<Route path={"/show_qr"} element={<QR />} />
				<Route path={"/pinkpong"} element={<PinkPong />} />
				<Route path={"/classicWaitingroom"} element={<ClassicWaitingRoom />} />
				<Route path={"/PinkPongWaitingroom"} element={<PinkPongWaitingRoom />} />
				<Route path={"/chat"} element={<Chat />} />
				<Route path={"/account"} element={<Account />} />
				<Route path={"/logged_in/:token"} element={<LoggedIn />} />
				<Route path={"/signup"} element={<Signup />} />
				<Route path={"/userInfo/:id"} element={<UserInfo statusWebsocket={statusWebSocket}/>} />
			</Routes>
		</ThemeProvider>
	);
}

export default App;
