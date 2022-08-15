import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import Stack from '@mui/material/Stack';
import { useEffect, useState } from 'react';
import { io } from "socket.io-client";
import SpectateComp from './SpectateComp';
import { get_backend_host } from './utils';

const Spectate = () => {
	const [channelsWebSocket, setChannelsWebsocket] = useState(null);

	useEffect(() => {
		if (!channelsWebSocket) {
			console.log("Opening channels websocket")
			const socket = io(get_backend_host() + "/channels-ws", {
				withCredentials: true,
				path: "/channels-ws/socket.io" 
			})
			setChannelsWebsocket(socket as any)
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
