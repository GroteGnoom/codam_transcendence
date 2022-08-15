import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import { useEffect, useRef } from 'react';
import { get_backend_host } from './utils';
import {CircularProgress, Typography} from '@mui/material';

// const pinkTheme = createTheme({ palette: { primary: pink } })

const InviteWaitingRoomClassic = () => {
    const webSocket: any = useRef(null); // useRef creates an object with a 'current' property
    const webSocketMatch: any = useRef(null); // useRef creates an object with a 'current' property
    let navigate = useNavigate();

    let Player1: Number = 0;
    let Player2: Number = 0;

    useEffect(() => {
    console.log('Opening WebSocket');
    webSocket.current = io(get_backend_host() + "/inviteWaitingroom-ws", {
        withCredentials: true,
        path: "/inviteWaitingroom-ws/socket.io"
    });
    webSocketMatch.current = io(get_backend_host() + "/match-ws", {
        withCredentials: true,
        path: "/match-ws/socket.io"
    });

    //get Player2

    const getPlayer1 = async () => {
        if (!Player1) {
            await fetch(get_backend_host() + `/users/user`, { 
                method: 'GET',
                credentials: 'include',
            }).then((response) => response.json())
            .then((response) => {Player1 = response.id})
        }
        if (Player1 !== 0 && Player1 === Player2)
            Player1 = 0;
    }

    getPlayer1();

    webSocket.current.emit("loggedInInvite", {
        "Player1": Player1,
        "Player2": Player2,
        "PinkPong": false
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

        console.log("User: ", user);
        console.log("Player1: ", P1);
        console.log("Player2: ", P2);
        
        if (Number(user) === Number(P1) || Number(user) === Number(P2)) {
            console.log("Emit start game");
            webSocketMatch.current.emit("startGame", {
                "Player1": P1,
                "Player2": P2,
                "PinkPong": false
            });
            navigate("/pinkpong", { replace: true });
        }
        else {
            console.log("Dit is niet de bedoeling...");
        }
    }

    webSocket.current.on("found2PlayersInvite", startGame ) // subscribe on backend events
    webSocket.current.on("redirectHomeInvite", redirHome ) // subscribe on backend events

    async function redirHome(payload: any) {
        console.log("RedirHome");
        const li =  fetch(get_backend_host() + "/auth/amiloggedin", { 
			method: 'GET',
			credentials: 'include',
		}).then(response => response.json());
        console.log(await li);
        if (await li === false)
            navigate("/", { replace: true });
    }

    return () => {
        webSocket.current.emit("playerLeftInvite", {});
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

export default InviteWaitingRoomClassic;
