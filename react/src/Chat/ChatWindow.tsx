import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SendIcon from '@mui/icons-material/Send';
import SettingsIcon from '@mui/icons-material/Settings';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { Container, Divider, FormControl, Grid, IconButton, List, ListItem, Paper, SpeedDial, SpeedDialAction, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, { Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { get_backend_host } from '../utils';
import AddUserWindow from './AddUserWindow';
import { Channel } from './Chat.types';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import { io } from "socket.io-client";

const ENTER_KEY_CODE = 13;

interface ChatWindowProps { 
    channelsWebSocket: any;
    channel: Channel;
    openSettings: any;
    setError: any;
    navigation: any;
}

interface ChatWindowState { 
    messages: any[];
    text: string;
    addUserOpen: boolean;
    gameInviteOpen: boolean;
    muted: boolean;
    blockedUsers: number[];
    currentUser: any; // currently logged in user
}

class ChatWindow extends React.Component<ChatWindowProps, ChatWindowState> {
    constructor(props: ChatWindowProps){
        super(props);
        this.state = { 
            messages: [], 
            text: "",
            addUserOpen: false,
            gameInviteOpen: false,
            muted: false,
            blockedUsers: [],
            currentUser: undefined
        }
        this.inviteWebSocket = io(get_backend_host() + "/inviteWaitingroom-ws", {
            withCredentials: true,
            path: "/inviteWaitingroom-ws/socket.io"
        });
    }

    inviteWebSocket: any;

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
        return await fetch(get_backend_host() + `/users/user`, { 
            method: 'GET',
            credentials: 'include',
        })
		.then((response) => response.json())
        .then((response) => {
            this.setState({ blockedUsers: response.blockedUsers });
        })
    }

    async getCurrentUser() {
        return await fetch(get_backend_host() + "/users/user", { 
            method: 'GET',
            credentials: 'include',
        })
		.then((response) => response.json())
        .then((response) => {
            this.setState({ currentUser: response });
        })
    }

    onReceiveMessage(socketMessage: any){   //subscribed to recMessage events through ws
        if (socketMessage.channel === this.props.channel.name) {
            console.log("Received a message for this channel")
            this.setState( { messages: [...this.state.messages, socketMessage.message] } );
        }           
    }

    onUserMuted(payload: any, muted: boolean) {
        if (this.props.channel.name === payload.channel 
            && this.state.currentUser 
            && Number(payload.userId) === Number(this.state.currentUser.id)) {
                console.log("I am muted", muted)
                this.setState({muted: muted}) // true or false depending on which event type is received
        }
    }

    async inviteClassicPong(){
        await this.props.channelsWebSocket.emit("sendMessage", { 
            "channel": this.props.channel.name,
            "message": {
                "text": "Join me for a game of <a href='inviteWaitingRoomClassic/" + this.props.channel.name.split('-')[1] + "/" + this.props.channel.name.split('-')[2] + "'>Classic Pong!</a>", //<a> is HTML link element (anchor)
                "invite": true
            }
        })
        await this.inviteWebSocket.emit("loggedInInvite", {
            "Player1": this.props.channel.name.split('-')[1],
            "Player2": this.props.channel.name.split('-')[2],
            "PinkPong": false
        })
        const { navigation } = this.props;
        navigation("/inviteWaitingRoomClassic/" + this.props.channel.name.split('-')[1] + "/" + this.props.channel.name.split('-')[2], { replace: true });
    }
    
    async invitePinkPong(){
        await this.props.channelsWebSocket.emit("sendMessage", { 
            "channel": this.props.channel.name,
            "message": {
                "text": "Join me for a game of <a href='inviteWaitingRoomPinkPong/" + this.props.channel.name.split('-')[1] + "/" + this.props.channel.name.split('-')[2] + "'>Pink Pong!</a>", //<a> is HTML link element (anchor)
                "invite": true
            }
        })
        console.log("Pressed link");
        await this.inviteWebSocket.emit("loggedInInvite", {
            "Player1": this.props.channel.name.split('-')[1],
            "Player2": this.props.channel.name.split('-')[2],
            "PinkPong": true
        })
        const { navigation } = this.props;
        navigation("/inviteWaitingRoomPinkPong/" + this.props.channel.name.split('-')[1] + "/" + this.props.channel.name.split('-')[2], { replace: true });
    }
    
    subscribeWebsocketEvents() {
        this.props.channelsWebSocket.on("recMessage", (payload: any) => {this.onReceiveMessage(payload)} )
        this.props.channelsWebSocket.on("userMuted", (payload: any) => {this.onUserMuted(payload, true)} )
        this.props.channelsWebSocket.on("userUnmuted", (payload: any) => {this.onUserMuted(payload, false)} )
    }

    componentDidMount() {
        this.getBlockedUsers()
        .then( () => this.getMessages() )
        this.getCurrentUser()
        this.subscribeWebsocketEvents()
        this.checkIfMuted()
    }
    
    componentDidUpdate(prevProps: ChatWindowProps, prevState: ChatWindowState) { 
        if (
            !prevProps.channel || !this.props.channel ||
            prevProps.channel.name !== this.props.channel.name) {
            this.getMessages()
        }
    }

    async postMessage() {
        this.props.channelsWebSocket.emit("sendMessage", { 
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
    
    handleEnterKey(event: any) {
        if(event.keyCode === ENTER_KEY_CODE){
            this.postMessage();
        }
    }
    
    handleClose = () => {
        this.setState( {addUserOpen: false} );
    };
    
    render() {
        const filteredMessages = this.state.messages.filter((msg) => 
            !this.state.blockedUsers.includes(Number(msg.sender.id)))
        
        const listChatMessages = filteredMessages.map((msg, index) => {
            return (
                <ListItem key={index}>
                    <div>
                        <Typography variant="caption">
                            {`${this.formatMessageTime(msg)}`}
                        </Typography>
                        <Typography variant="body1">
                            <Link to={{ pathname:`/userinfo/${msg.sender.id}`} } style={{ color: '#e91e63' }}>
                                {`${msg.sender.username}`}
                            </Link>
                        </Typography>
                        {msg.invite &&
                            <Typography variant="h6"
                            dangerouslySetInnerHTML={{
                                __html: `${msg.text} ` // make links work https://stackoverflow.com/questions/66028355/material-ui-styles-and-html-markdown 
                            }}>
                            </Typography>
                        }
                        {!msg.invite &&
                        <Container fixed disableGutters={true} maxWidth='md'>
                            <Typography style={{ wordWrap: "break-word" }} variant="h6">
                                {msg.text}
                            </Typography> 
                            </Container>
                        }
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
                                    { this.state.currentUser && this.props.channel.displayName && this.props.channel.name.split('-')[1] !== this.state.currentUser.id &&
                                        <Typography variant="h4" gutterBottom>
                                            <Link to={{ pathname:`/userinfo/${this.props.channel.name.split('-')[1]}`} } style={{ color: '#000000' }}>
                                            {this.props.channel.displayName ? this.props.channel.displayName : this.props.channel.name}
                                        </Link> 
                                        </Typography>
                                    }
                                    { this.state.currentUser && this.props.channel.displayName && this.props.channel.name.split('-')[2] !== this.state.currentUser.id &&
                                        <Typography variant="h4" gutterBottom>
                                            <Link to={{ pathname:`/userinfo/${this.props.channel.name.split('-')[2]}`} } style={{ color: '#000000' }}>
                                            {this.props.channel.displayName ? this.props.channel.displayName : this.props.channel.name}
                                        </Link> 
                                        </Typography>
                                    }
                                    { !this.props.channel.displayName &&
                                        <Typography variant="h4" gutterBottom>
                                            {this.props.channel.displayName ? this.props.channel.displayName : this.props.channel.name}
                                        </Typography>
                                    }
                            </Grid>
                            <Grid xs={1} item>
                                { this.props.channel.channelType !== "direct message" &&
                                    <IconButton onClick={() => { this.props.openSettings(true) }}
                                    color="secondary">
                                            <SettingsIcon style={{ color: '#ec407a' }}/>
                                    </IconButton>
                                }
                            </Grid>
                            <Grid sx={{position: 'relative'}} xs={1} item>
                                { this.props.channel.channelType !== "direct message" &&
                                    <IconButton onClick={() => { this.setState( {addUserOpen: true} ) }}
                                    color="secondary">
                                            <PersonAddIcon style={{ color: '#ec407a' }}/>
                                    </IconButton>
                                }
                                { this.props.channel.channelType === "direct message" && // challenge another player to a game
                                    <SpeedDial
                                    direction={'down'}
                                    ariaLabel="SpeedDial tooltip example"
                                    sx={{position: 'absolute', top: -40, }}
                                    icon={<SportsEsportsIcon />}
                                    onClose={() => { this.setState( {gameInviteOpen: false} ) }}
                                    onOpen={() => { this.setState( {gameInviteOpen: true} ) }}
                                    open={this.state.gameInviteOpen}
                                    >
                                    <SpeedDialAction
                                        // FabProps={{ sx: { bgcolor: '#fcc6ff','&:hover': { bgcolor: '#fcc6ff', }} }}
                                        key={'Classic'}
                                        icon={<VideogameAssetIcon style={{ color: '#f06292' }}/>}
                                        tooltipTitle={'Classic'}
                                        tooltipOpen
                                        onClick={() => this.inviteClassicPong()}
                                        />
                                    <SpeedDialAction
                                        key={'Special'}
                                        icon={<SportsEsportsIcon style={{ color: '#f06292' }}/>}
                                        tooltipTitle={'Special'}
                                        tooltipOpen
                                        onClick={() => this.invitePinkPong()}
                                        />
                                    </SpeedDial> 
                                }
                            </Grid>
                        </Grid>
                        {this.state.addUserOpen && <AddUserWindow open={this.state.addUserOpen} handleClose={this.handleClose} 
                                        activeChannel={this.props.channel.name} setError={this.props.setError} />}
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
                                        onKeyDown={(e) => this.handleEnterKey(e)}
                                        disabled={this.state.muted}
                                        inputProps={{ maxLength: 140 }}
                                        value={this.state.text}
                                        label="Type your message..."
                                        variant="outlined"/>
                                </FormControl>
                            </Grid>
                            <Grid xs={1} item>
                                <IconButton type="submit" onClick={() => this.postMessage()}
                                    disabled={this.state.muted}
                                    color="secondary">
                                        <SendIcon style={{ color: '#ec407a' }}/>
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

export default function ChatWindowFunction(props: any) {
    const navigation = useNavigate();
    
    return <ChatWindow {...props} navigation={navigation} />;
}
