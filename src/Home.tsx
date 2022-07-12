import React from 'react';
import {Link} from 'react-router-dom';

const Home = () =>
{
	return (
		<main>
            <div className="App">
            <header className="App-header">

            <Link to= {{pathname:"/register"}}><button>Register</button></Link>
            <Link to= {{pathname:"/login"}}><button>Login</button></Link>
            <Link to= {{pathname:"/pinkpong"}}><button>PinkPong</button></Link>
            </header>
            </div>
		</main>
	)
}

export default Home
