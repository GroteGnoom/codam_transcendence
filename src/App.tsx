import './App.css';
import { Routes, Route } from "react-router-dom";
import Home from './Home';
import Register from './Register';
import Login from './Login';
import PinkPong from './PinkPong';

function App() {
	return (
		<Routes>
        <Route path={"/"} element={<Home />} />
        <Route path={"/register"} element={<Register />} />
        <Route path={"/login"} element={<Login />} />
        <Route path={"/pinkpong"} element={<PinkPong />} />
      	</Routes>
		);
	}

export default App;
