import React, { useState } from 'react';

interface ChatWindowProps { 
    channel: string;
}

interface ChatWindowState { 
    messages: any[];
}

class ChatWindow extends React.Component<ChatWindowProps, ChatWindowState> {
    render() {
        return (
            <div>{this.props.channel}</div>
        )
    }
}

export default ChatWindow