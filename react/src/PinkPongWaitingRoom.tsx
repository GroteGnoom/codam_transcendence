import { CircularProgress, Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import { get_backend_host } from './utils';

const PinkPongWaitingRoom = () => {
    const webSocket: any = useRef(null); // useRef creates an object with a 'current' property
    const webSocketMatch: any = useRef(null); // useRef creates an object with a 'current' property
    let navigate = useNavigate();

    useEffect(() => {
    webSocket.current = io(get_backend_host() + "/PinkPongWaitingRoom-ws", {
        withCredentials: true,
        path: "/PinkPongWaitingRoom-ws/socket.io"
    });
    webSocketMatch.current = io(get_backend_host() + "/match-ws", {
        withCredentials: true,
        path: "/match-ws/socket.io"
    });

    webSocket.current.emit("loggedInPinkPong", {
        "loggedIn": true
    });

    async function startGame(payload: any) {
        let user:number = 0;
        await fetch(get_backend_host() + `/users/user`, { 
            method: 'GET',
            credentials: 'include',
        }).then((response) => response.json())
        .then((response) => {user = response.id})

        let P1:number = payload.Player1;
        let P2:number = payload.Player2;
        
        if (Number(user) === Number(P1) || Number(user) === Number(P2)) {
            webSocketMatch.current.emit("startGame", {
                "Player1": payload.Player1,
                "Player2": payload.Player2,
                "ID": payload.id,
                "PinkPong": true
            });
            navigate("/pinkpong", { replace: true });
        }
        else {
            navigate("/", { replace: true });
        }
    }

    webSocket.current.on("found2PlayersPinkPong", startGame ) // subscribe on backend events
    webSocket.current.on("redirectHomePinkPong", redirHome ) // subscribe on backend events

    async function redirHome(payload: any) {
        const li =  fetch(get_backend_host() + "/auth/amiloggedin", { 
			method: 'GET',
			credentials: 'include',
		}).then(response => response.json());
        if (await li === false)
            navigate("/", { replace: true });
    }

    return () => {
        webSocket.current.emit("playerLeftPinkPong", {});
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
