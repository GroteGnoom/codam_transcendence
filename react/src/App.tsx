import './App.css';
import { Routes, Route } from "react-router-dom";
import Home from './Home';
import QR from './QR';
import CheckTfa from './CheckTfa';
import PinkPong from './PinkPong';
import Chat from './Chat/Chat';
import Account from './account/Account';
import LoggedIn from './LoggedIn';
import WaitingRoom from './WaitingRoom';

function App() {
	return (
		<Routes>
			<Route path={"/"} element={<Home />} />
			<Route path={"/check_2fa"} element={<CheckTfa />} />
			<Route path={"/show_qr"} element={<QR />} />
			<Route path={"/pinkpong"} element={<PinkPong />} />
			<Route path={"/waitingroom"} element={<WaitingRoom />} />
			<Route path={"/chat"} element={<Chat />} />
			<Route path={"/account"} element={<Account />} />
			<Route path={"/logged_in/:token"} element={<LoggedIn />} />
      	</Routes>
		);
	}

export default App;
