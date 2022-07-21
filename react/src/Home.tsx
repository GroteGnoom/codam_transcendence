import React from 'react';
import {Link} from 'react-router-dom';
import Button from '@mui/material/Button';
import { pink } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const pinkTheme = createTheme({ palette: { primary: pink } })

const Home = () =>
{
	return (
            <ThemeProvider theme={pinkTheme}>
		<main>
            <div className="App">
            <header className="App-header">
                  <Link to= {{pathname:"/register"}}><Button variant="contained">Register</Button></Link>
                  <Link to= {{pathname:"/login"}}><Button variant="contained">Login</Button></Link>
                  <Link to= {{pathname:"/pinkpong"}}><Button variant="contained">PinkPong</Button></Link>
                  <Link to= {{pathname:"/chat"}}><Button variant="contained">Chat</Button></Link>
            </header>
            </div>
		</main>
            </ThemeProvider>
	)
}

export default Home
