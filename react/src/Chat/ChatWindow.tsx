import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SendIcon from '@mui/icons-material/Send';
import SettingsIcon from '@mui/icons-material/Settings';
import { Container, Divider, FormControl, Grid, IconButton, Link, List, ListItem, Paper, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { Fragment } from 'react';
import { io } from "socket.io-client";
import { get_backend_host } from '../utils';
import AddUserWindow from './AddUserWindow';
import { Channel } from './Chat.types';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import BlockIcon from '@mui/icons-material/Block';

interface ChatWindowProps { 
    channel: Channel;
    openSettings: any;
    setError: any;
}

interface ChatWindowState { 
    messages: any[];
    text: string;
    addUserOpen: boolean;
    muted: boolean;
    blockedUsers: number[];
}

class ChatWindow extends React.Component<ChatWindowProps, ChatWindowState> {
    private webSocket: any = undefined;

    constructor(props: ChatWindowProps){
        super(props);
        this.state = { 
            messages: [], 
            text: "",
            addUserOpen: false,
            muted: false,
            blockedUsers: [],
        }
    }

    async getMessages(){
        return await fetch(get_backend_host() + `/channels/${this.props.channel.name}/messages`, { 
            method: 'GET',
            credentials: 'include',
        })
		.then((response) => response.json())
        .then((response) => {
            this.setState({ messages: response }); 
        })
    }

    async checkIfMuted() {
		return await fetch(get_backend_host() + `/channels/${this.props.channel.name}/is-muted`, { 
            method: 'GET',
            credentials: 'include',
        })
        .then((response) => response.json())
        .then((response) => this.setState({muted: response}))
	}

    async getBlockedUsers(){
        return await fetch(get_backend_host() + `/users/id`, { 
            method: 'GET',
            credentials: 'include',
        })
		.then((response) => response.json())
        .then((response) => {
            this.setState({ blockedUsers: response.blockedUsers });
        })
    }

    onReceiveMessage(socketMessage: any){   //subscribed to recMessage events through ws
        if (socketMessage.channel === this.props.channel.name) {
            console.log("Received a message for this channel")
            this.setState( { messages: [...this.state.messages, socketMessage.message] } );
        } else {
            console.log(`Message for ${socketMessage.channel} is not important` )
        }        
    }

    onUserMuted(payload: any, muted: boolean) {
        if (this.props.channel === payload.channel) {
            console.log("User muted", muted, payload)
            this.checkIfMuted() // todo find out who current user is in this component to compare
        }
    }

    openWebsocket() {
        if (!this.webSocket) {
            console.log('Opening WebSocket');
            this.webSocket = io(`http://${get_backend_host()}:5000`, {withCredentials: true});
            this.webSocket.on("recMessage", (payload: any) => {this.onReceiveMessage(payload)} )
            this.webSocket.on("userMuted", (payload: any) => {this.onUserMuted(payload, true)} )
            this.webSocket.on("userUnmuted", (payload: any) => {this.onUserMuted(payload, false)} )
        }
    }

    componentDidMount() {
        console.log("Mounting", this.props.channel)
        this.getBlockedUsers().then(() =>
            this.getMessages()
        )
        this.openWebsocket()
        this.checkIfMuted()
    }

    componentWillUnmount() {
        console.log("Closing websocket")
        this.webSocket.close()
    }

    componentDidUpdate(prevProps: ChatWindowProps, prevState: ChatWindowState) { 
        if (
            !prevProps.channel ||
            !this.props.channel ||
            prevProps.channel.name !== this.props.channel.name) {
            this.getMessages()
        }
    }

    async postMessage() {
        this.webSocket.emit("sendMessage", { 
            "channel": this.props.channel.name,
            "message": {
                "text": this.state.text
            }
        }) //There is no need to run JSON.stringify() on objects as it will be done for you by Socket.io
        this.setState({text: ""})
	}

    formatMessageTime(message: any) {
        const date = new Date(message.date)
        return `${date.toLocaleString()}`
    }

    handleClose = () => {
        this.setState( {addUserOpen: false} );
    };

    render() {
        // console.log(this.state.blockedUsers)
        const filteredMessages = this.state.messages.filter((msg) => 
            !this.state.blockedUsers.includes(Number(msg.sender.id))
        )
        // console.log(filteredMessages)

        const listChatMessages = filteredMessages.map((msg, index) => {
            return (
                <ListItem key={index}>
                    <div>
                        <Typography variant="caption">
                            {`${this.formatMessageTime(msg)}`}
                        </Typography>
                        <Typography variant="body1">
                            <Link href={`http://localhost:3000/userinfo/${msg.sender.id}`} underline="hover">
                                {`${msg.sender.username}`}
                            </Link>
                        </Typography>
                        <Typography variant="h6">
                            {`${msg.text} `}
                        </Typography>
                    </div>
                </ListItem> 
            )}
        );
        
        return (
            <Fragment>
                <Container>
                    <Paper elevation={5} sx={{ bgcolor: '#f48fb1'}}>
                        <Box p={3} sx={{ m:5 }}>
                            <Grid container direction="row" alignItems="center">
                                <Grid xs={10} item>
                                    <Typography variant="h4" gutterBottom>
                                        {this.props.channel.name}
                                    </Typography>
                                </Grid>
                                <Grid xs={1} item>
                                    { this.props.channel.channelType !== "direct message" &&
                                        <IconButton onClick={() => { this.props.openSettings(true) }}
                                            color="secondary">
                                                <SettingsIcon />
                                        </IconButton>
                                    }
                                    { this.props.channel.channelType === "direct message" && // challenge another player to a game
                                        <IconButton //onClick={() => { this.props.openSettings(true) }}
                                            color="secondary">
                                                <SportsEsportsIcon />
                                        </IconButton>
                                    }
                                </Grid>
                                <Grid xs={1} item>
                                    { this.props.channel.channelType !== "direct message" &&
                                        <IconButton onClick={() => { this.setState( {addUserOpen: true} ) }}
                                            color="secondary">
                                                <PersonAddIcon />
                                        </IconButton>
                                    }
                                    { this.props.channel.channelType === "direct message" && // block another user
                                        <IconButton //onClick={() => { this.props.blockUser() }}
                                            color="secondary">
                                                <BlockIcon />
                                        </IconButton>
                                    }
                                </Grid>
                            </Grid>
                            <AddUserWindow  open={this.state.addUserOpen} handleClose={this.handleClose} 
                                            activeChannel={this.props.channel.name} setError={this.props.setError} />
                            <Divider />
                            <Grid container spacing={4} alignItems="center">
                                <Grid id="chat-window" xs={12} item>
                                    <List id="chat-window-messages">
                                        {listChatMessages}
                                        <ListItem></ListItem>
                                    </List>
                                </Grid>
                                <Grid xs={9} item>
                                    <FormControl fullWidth>
                                        <TextField onChange={(e) => this.setState({text: e.target.value})}
                                            disabled={this.state.muted}
                                            value={this.state.text}
                                            label="Type your message..."
                                            variant="outlined"/>
                                    </FormControl>
                                </Grid>
                                <Grid xs={1} item>
                                    <IconButton type="submit" onClick={() => this.postMessage()}
                                        disabled={this.state.muted}
                                        color="secondary">
                                            <SendIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </Container>
            </Fragment>
        );
    }
}

export default ChatWindow