import './App.css';
import { Routes, Route } from "react-router-dom";
import Home from './Home';
import Register from './Register';
import Login from './Login';
import OAuthPopup from './OAuth2Popup';
import PinkPong from './PinkPong';

function App() {
	return (
		<Routes>
        <Route path={"/"} element={<Home />} />
        <Route path={"/register"} element={<Register />} />
        <Route path={"/login"} element={<Login />} />
        <Route path={"/pinkpong"} element={<PinkPong />} />
		<Route element={<OAuthPopup />} path="/callback" />
      	</Routes>
		);
	}

export default App;
