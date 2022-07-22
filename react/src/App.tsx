import './App.css';
import { Routes, Route } from "react-router-dom";
import Home from './Home';
import Login from './Login';
import PinkPong from './PinkPong';
import Chat from './Chat/Chat';
import Account from './account/Account';
import Logged_in from './Logged_in';

function App() {
	return (
		<Routes>
			<Route path={"/"} element={<Home />} />
			<Route path={"/login"} element={<Login />} />
			<Route path={"/pinkpong"} element={<PinkPong />} />
			<Route path={"/chat"} element={<Chat />} />
			<Route path={"/account"} element={<Account />} />
			<Route path={"/logged_in/:token"} element={<Logged_in />} />
      	</Routes>
		);
	}

export default App;
