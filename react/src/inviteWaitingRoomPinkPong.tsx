import { useNavigate, useParams } from 'react-router-dom';
import { io } from "socket.io-client";
import { useEffect, useRef } from 'react';
import { get_backend_host } from './utils';
import {CircularProgress, Typography} from '@mui/material';

const InviteWaitingRoomPinkPong = () => {
    const webSocket: any = useRef(null); // useRef creates an object with a 'current' property
    const webSocketMatch: any = useRef(null); // useRef creates an object with a 'current' property
    let { Player1, Player2 } = useParams();
    let navigate = useNavigate();

    useEffect(() => {
    webSocket.current = io(get_backend_host() + "/inviteWaitingroom-ws", {
        withCredentials: true,
        path: "/inviteWaitingroom-ws/socket.io"
    });
    webSocketMatch.current = io(get_backend_host() + "/match-ws", {
        withCredentials: true,
        path: "/match-ws/socket.io"
    });

    webSocket.current.emit("loggedIn", {
        "Player1": Number(Player1),
        "Player2": Number(Player2),
        "PinkPong": true
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
            await webSocketMatch.current.emit("startGame", {
                "Player1": P1,
                "Player2": P2,
                "PinkPong": true
            });
            navigate("/pinkpong", { replace: true });
        }
    }

    webSocket.current.on("found2PlayersInvite", startGame ) // subscribe on backend events
    webSocket.current.on("redirectHomeInvite", redirHome ) // subscribe on backend events

    async function redirHome(payload: any) {
        const li =  fetch(get_backend_host() + "/auth/amiloggedin", { 
			method: 'GET',
			credentials: 'include',
		}).then(response => response.json());
        if (await li === false)
            navigate("/", { replace: true });
    }

    return () => {
        webSocket.current.emit("playerLeftInvite", {});
        webSocket.current.close();
    }
    }, );

    return (
        <main>
            <div className="menu">
                <Typography variant="h3" color="primary">
                    Waiting for opponent
                </Typography>
                <CircularProgress/>
            </div>
        </main>
    )
}

export default InviteWaitingRoomPinkPong;
