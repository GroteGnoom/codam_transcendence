import { pink } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import { useEffect, useRef } from 'react';

const pinkTheme = createTheme({ palette: { primary: pink } })


const WaitingRoom = () => {
    const webSocket: any = useRef(null); // useRef creates an object with a 'current' property
    let navigate = useNavigate();

    useEffect(() => {
    console.log('Opening WebSocket');
    webSocket.current = io('http://127.0.0.1:5000', {
        withCredentials: true
    });

    webSocket.current.emit("loggedIn", {
        "loggedIn": true
    });

    function startGame(payload: any) {
        webSocket.current.emit("startGame", {
            "Player1": payload.Player1,
            "Player2": payload.Player2
        });
        navigate("/pinkpong", { replace: true });
    }

    webSocket.current.on("found2Players", startGame ) // subscribe on backend events

    return () => {
        console.log('Closing WebSocket');
        webSocket.current.close();
    }
    }, []);

    return (
        <ThemeProvider theme={pinkTheme}>
            <main>

            </main>
        </ThemeProvider>
    )
}

export default WaitingRoom;
