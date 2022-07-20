import React, { useState } from 'react';
import ChatWindow from './ChatWindow';
import ChannelList from './ChannelList';
import Stack from '@mui/material/Stack';


const Chat = () => {
    const [activeChannel, setActiveChannel] = useState();// return prop and setter

	return (
		<main>
			<Stack direction="row">
				<ChannelList openChat={setActiveChannel} activeChannel={activeChannel} />
            	{activeChannel && <ChatWindow channel={activeChannel} />}
			</Stack>
		</main>
	)
}

export default Chat