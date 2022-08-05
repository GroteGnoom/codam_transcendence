import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import { useEffect, useRef } from 'react';
import { get_backend_host } from './utils';
import {CircularProgress, Typography} from '@mui/material';

// const pinkTheme = createTheme({ palette: { primary: pink } })

const PinkPongWaitingRoom = () => {
    const webSocket: any = useRef(null); // useRef creates an object with a 'current' property
    let navigate = useNavigate();

    useEffect(() => {
    console.log('Opening WebSocket');
    webSocket.current = io(get_backend_host(), {
        withCredentials: true
    });

    webSocket.current.emit("loggedInPinkPong", {
        "loggedIn": true
    });

    function startGame(payload: any) {
        webSocket.current.emit("startGame", {
            "Player1": payload.Player1,
            "Player2": payload.Player2,
            "PinkPong": true
        });
        navigate("/pinkpong", { replace: true });
    }

    webSocket.current.on("found2PlayersPinkPong", startGame ) // subscribe on backend events
    webSocket.current.on("redirectHomePinkPong", redirHome ) // subscribe on backend events

    function redirHome() {
        navigate("/", { replace: true });
    }

    return () => {
        webSocket.current.emit("playerLeftPinkPong", {});
        console.log('Closing WebSocket');
        webSocket.current.close();
    }
    }, );

    return (
        <main>
            <div className="menu">
                <Typography variant="h3" color="primary">
                    Searching for opponent
                </Typography>
                <CircularProgress/>
            </div>
        </main>
    )
}

export default PinkPongWaitingRoom;
