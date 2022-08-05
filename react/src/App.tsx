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

const pinkTheme = createTheme({ palette: { primary: pink } })

function App() {
	return (
		<ThemeProvider theme={pinkTheme}>
			<Routes>
				<Route path={"/"} element={<Home />} />
				<Route path={"/check_2fa"} element={<CheckTfa />} />
				<Route path={"/show_qr"} element={<QR />} />
				<Route path={"/pinkpong"} element={<PinkPong />} />
				<Route path={"/classicWaitingroom"} element={<ClassicWaitingRoom />} />
				<Route path={"/PinkPongWaitingroom"} element={<PinkPongWaitingRoom />} />
				<Route path={"/chat"} element={<Chat />} />
				<Route path={"/account"} element={<Account />} />
				<Route path={"/logged_in/:token"} element={<LoggedIn />} />
				<Route path={"/signup"} element={<Signup />} />
				<Route path={"/userInfo/:id"} element={<UserInfo />} />
			</Routes>
		</ThemeProvider>
	);
}

export default App;
