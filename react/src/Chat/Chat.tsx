import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import Stack from '@mui/material/Stack';
import { useState } from 'react';
import ChannelList from './ChannelList';
import ChannelSettings from './ChannelSettings';
import ChatWindow from './ChatWindow';
import DirectMessage from "./DirectMesssages";

const Chat = () => {
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
					< DirectMessage openChat={setActiveChannel} activeChannel={activeChannel} setError={setError} />
					</Stack>
					{activeChannel && <ChatWindow channel={activeChannel} openSettings={openSettings} />}
					{settingsOpen && activeChannel && <ChannelSettings channel={activeChannel} openSettings={openSettings} setError={setError} />}
					{errorPopup}
			</Stack>
		</main>
	)
}

export default Chat
