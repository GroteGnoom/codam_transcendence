import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import Stack from '@mui/material/Stack';
import { useEffect, useState } from 'react';
import { io } from "socket.io-client";
import SpectateComp from './SpectateComp';
import { get_backend_host } from './utils';
import { useNavigate } from "react-router-dom";

const Spectate = () => {
	const [channelsWebSocket, setChannelsWebsocket] = useState(null);
	let navigate = useNavigate();

	useEffect(() => {
		if (!channelsWebSocket) {
			console.log("Opening channels websocket")
			const socket = io(get_backend_host() + "/channels-ws", {
				withCredentials: true,
				path: "/channels-ws/socket.io" 
			})
			socket.on("redirectHomeChat", redirHome ) // subscribe on backend events
			setChannelsWebsocket(socket as any)
		}

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
            console.log('Closing WebSocket');
			if (channelsWebSocket){
				(channelsWebSocket as any).close();
			}
        }
	}, []);

	return (
		<main>
			<SpectateComp />
		</main>
	)
}

export default Spectate
