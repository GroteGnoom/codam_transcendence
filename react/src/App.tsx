import './App.css';
import { Routes, Route } from "react-router-dom";
import Home from './Home';
import Login from './Login';
import PinkPong from './PinkPong';
import Chat from './Chat/Chat';
import Account from './account/Account';
import LoggedIn from './LoggedIn';

function App() {
	return (
		<Routes>
			<Route path={"/"} element={<Home />} />
			<Route path={"/login"} element={<Login />} />
			<Route path={"/pinkpong"} element={<PinkPong />} />
			<Route path={"/chat"} element={<Chat />} />
			<Route path={"/account"} element={<Account />} />
			<Route path={"/logged_in/:token"} element={<LoggedIn />} />
      	</Routes>
		);
	}

export default App;
