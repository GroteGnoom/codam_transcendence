import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import Stack from '@mui/material/Stack';
import { useEffect, useState } from 'react';
import ChannelList from './ChannelList';
import ChannelSettings from './ChannelSettings';
import ChatWindow from './ChatWindow';
import DirectMessage from "./DirectMesssages";
import { io } from "socket.io-client";
import { get_backend_host } from "../utils";

const Chat = () => {
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

    const [activeChannel, setActiveChannel] = useState(undefined);// return prop and setter
	const [settingsOpen, openSettings] = useState(false);
	const [error, setError] = useState("");

	const errorPopup = (<Dialog open={error !== ""} >  {/*pop window for new error message */}
		<DialogTitle>Ohh noooss</DialogTitle>
		<DialogContent>
			<Alert severity="error">
				{error}
			</Alert>
		</DialogContent>
		<DialogActions>
			<Button variant="contained" onClick={() => setError("")}>I'm sorry</Button>
		</DialogActions>
	</Dialog>);

	return (
		<main>
			<Stack direction="row">
				<Stack direction="column">
					<ChannelList openChat={setActiveChannel} activeChannel={activeChannel} setError={setError} />
					<DirectMessage channelsWebSocket={channelsWebSocket} openChat={setActiveChannel} activeChannel={activeChannel} setError={setError} />
					</Stack>
					{activeChannel && <ChatWindow channelsWebSocket={channelsWebSocket} channel={activeChannel} openSettings={openSettings} setError={setError}/>}
					{settingsOpen && activeChannel && <ChannelSettings channel={activeChannel} openSettings={openSettings} setError={setError} openChat={setActiveChannel}/>}
					{errorPopup}
			</Stack>
		</main>
	)
}

export default Chat
