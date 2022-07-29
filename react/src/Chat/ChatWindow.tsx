import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SendIcon from '@mui/icons-material/Send';
import SettingsIcon from '@mui/icons-material/Settings';
import { Container, Divider, FormControl, Grid, IconButton, List, ListItem, ListItemText, Paper, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { Fragment } from 'react';
import { io } from "socket.io-client";
import AddUserWindow from './AddUserWindow';

interface ChatWindowProps { 
    channel: string;
    openSettings: any;
}

interface ChatWindowState { 
    messages: any[];
    text: string;
    addUserOpen: boolean;
}

class ChatWindow extends React.Component<ChatWindowProps, ChatWindowState> {
    private webSocket: any = undefined;

    constructor(props: ChatWindowProps){
        super(props);
        this.state = { 
            messages: [], 
            text: "",
            addUserOpen: false,
        }
    }

    async getMessages(){
        return await fetch(`http://127.0.0.1:5000/channels/${this.props.channel}/messages`, { 
            method: 'GET',
            credentials: 'include',
        })
		.then((response) => response.json())
        .then((response) => {
            if (response.length !== this.state.messages.length) {
                this.setState({ messages: response });
            }
        })
    }

    onReceiveMessage(socketMessage: any){   //subscribed to recMessage events through ws
        if (socketMessage.channel === this.props.channel) {
            console.log("Received a message for this channel")
            this.setState( { messages: [...this.state.messages, socketMessage.message] } );
        } else {
            console.log(`Message for ${socketMessage.channel} is not important` )
        }        
    }

    openWebsocket() {
        if (!this.webSocket) {
            console.log('Opening WebSocket');
            this.webSocket = io('http://127.0.0.1:5000', {withCredentials: true});
            this.webSocket.on("recMessage", (payload: any) => {this.onReceiveMessage(payload)} )
        }
    }

    componentDidMount() {
        console.log("Mounting", this.props.channel)
        this.getMessages()
        this.openWebsocket()
    }

    componentDidUpdate() { // this function shouldnt be necessary, look for solution when switching channels
        console.log("updating")
        this.getMessages()
    }

    async postMessage() {
        this.webSocket.emit("sendMessage", { 
            "channel": this.props.channel,
            "message": {
                "sender": 7,
                "text": this.state.text
            }
        }) //There is no need to run JSON.stringify() on objects as it will be done for you by Socket.io
        this.setState({text: ""})
	}

    formatMessageTime(message: any) {
        const date = new Date(message.date)
        return `${date.toDateString()} ${date.toLocaleTimeString()}`
    }

    handleClose = () => {
        this.setState( {addUserOpen: false} );
    };

    render() {
        const listChatMessages = this.state.messages.map((chatMessageDto, index) => 
            <ListItem key={index}>
                <ListItemText 
                    primary={`${chatMessageDto.text}`} 
                    secondary={`${this.formatMessageTime(chatMessageDto)}`}/>
            </ListItem>
        );
        
        return (
            <Fragment>
                <Container>
                    <Paper elevation={5} sx={{ bgcolor: '#f48fb1'}}>
                        <Box p={3} sx={{ m:5 }}>
                            <Grid container direction="row" alignItems="center">
                                <Grid xs={10} item>
                                    <Typography variant="h4" gutterBottom>
                                        {this.props.channel}
                                    </Typography>
                                </Grid>
                                <Grid xs={1} item>
                                    <IconButton onClick={() => { this.props.openSettings(true) }}
                                        color="secondary">
                                            <SettingsIcon />
                                    </IconButton>
                                </Grid>
                                <Grid xs={1} item>
                                    <IconButton onClick={() => { this.setState( {addUserOpen: true} ) }}
                                        color="secondary">
                                            <PersonAddIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                            <AddUserWindow open={this.state.addUserOpen} handleClose={this.handleClose} activeChannel={this.props.channel}/>
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
                                            value={this.state.text}
                                            label="Type your message..."
                                            variant="outlined"/>
                                    </FormControl>
                                </Grid>
                                <Grid xs={1} item>
                                    <IconButton type="submit" onClick={() => this.postMessage()}
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