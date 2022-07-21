import './App.css';
import { Routes, Route } from "react-router-dom";
import Home from './Home';
import Login from './Login';
import PinkPong from './PinkPong';
import Chat from './Chat/Chat';
import Account from './account/Account';

function App() {
	return (
		<Routes>
			<Route path={"/"} element={<Home />} />
			<Route path={"/login"} element={<Login />} />
			<Route path={"/pinkpong"} element={<PinkPong />} />
			<Route path={"/chat"} element={<Chat />} />
			<Route path={"/account"} element={<Account />} />
      	</Routes>
		);
	}

export default App;
