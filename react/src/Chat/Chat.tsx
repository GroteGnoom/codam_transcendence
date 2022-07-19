import React, { useState } from 'react';
import ChatWindow from './ChatWindow';
import ChannelList from './ChannelList';

const Chat = () => {
    const [activeChannel, setActiveChannel] = useState();// return prop and setter

	return (
		<main>
			<ChannelList openChat={setActiveChannel} />
            {activeChannel && <ChatWindow channel={activeChannel} />}
		</main>
	)
}

export default Chat