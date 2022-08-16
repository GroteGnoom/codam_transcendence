import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import React from 'react';
import { Channel } from './Chat.types';
import AddIcon from '@mui/icons-material/Add';
import { get_backend_host } from '../utils';


interface DirectMessageProps { 
    channelsWebSocket: any;
    openChat: any;
    activeChannel?: Channel;
    setError: (err: string) => void;
}

interface DirectMessageState { 
    chats: Channel[];
    newChat: string;
    open: boolean;
    users: any[];
    selectedMember: any;
    currentUser: any; // currently logged in user
}

class DirectMessage extends React.Component<DirectMessageProps, DirectMessageState> {
    constructor(props: any) {
        super(props);
        this.state = { 
            chats: [], 
            newChat: "",
            open: false,
            users: [],
            selectedMember: '',
            currentUser: undefined,
        };
    }

    subscribeWebsocketEvents(){
        this.props.channelsWebSocket.on("newDM", () => {this.getChats()});
    }

    componentDidMount() {
        console.log("direct messages")
        this.getUsers()
        this.getCurrentUser()
        .then(() => this.getChats())

        //get notified when a new dm is created
        .then(() => this.subscribeWebsocketEvents())
    }

    addDisplayName(channel: Channel) {
        let displayName = channel.name;
        const otherMember = channel.members.filter((member) => member.user.id !== this.state.currentUser.id)
        if (otherMember.length > 0) {
            displayName = otherMember[0].user.username;
        }        
        return {...channel, displayName: displayName}
    }

    async getChats() {        
		return await fetch(get_backend_host() + "/channels/chats/direct-messages", { 
            method: 'GET',
            credentials: 'include',
        })
		.then((response) => response.json())
        .then((response) => {
            const chats = response.map((chat: Channel) => this.addDisplayName(chat))
            this.setState({ chats: chats });
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

    handleClickOpen = () => {
        this.setState( {open: true} );
    };
    
    handleClose = () => {
        this.setState( {open: false} );
    };

    handleChange = (event: SelectChangeEvent) => {
        this.setState({selectedMember: Number(event.target.value)});
        console.log("selectedmember: ", Number(event.target.value));
    };

    async getUsers(){
        fetch(get_backend_host() + `/users`, { method: 'GET'})
		.then((response) => response.json())
        .then((response) => {
            this.setState({ users: response });            
        })
    }

    async createDirectMessage() {
		return await fetch(get_backend_host() + `/channels/dm/${this.state.selectedMember}`, { 
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type':'application/json'},
        })
		.then(async (response) => {
            const json = await response.json();
            if (response.ok) {
                return json;
            } else {
                throw new Error(json.message)                
            }
        })            
        .then( () => this.handleClose() )
        .then( () => this.getChats() )
        .catch((err: Error) => {
            this.props.setError(err.message)
        })
	}


    renderChats = () => {
        const channel = this.state.chats.map((el) => (
            <ListItem sx={ { height: 40 } } key={el.name}> 
                <ListItemButton selected={ this.props.activeChannel && el.name===this.props.activeChannel.name} 
                    //</ListItem>onClick={() => this.props.openChat(el.name)}> {/* sets active channel */}
                    onClick={() => this.props.openChat(el) }> {/* sets active channel */}
                    <ListItemText primary={el.displayName} />
                </ListItemButton>    
            </ListItem>
        ))  
        channel.push (
            <ListItem key="NEW">
            <ListItemButton onClick={this.handleClickOpen}>
                <ListItemText primary="new chat" />
                <ListItemAvatar>
                    <Avatar sx={{ width: 24, height: 24 }}>
                        <AddIcon fontSize='small' style={{ color: '#e91e63' }}/>
                    </Avatar>
                </ListItemAvatar>
            </ListItemButton>
            </ListItem>
        )

        return (
        <List sx={{width: '100%', maxWidth: 250, bgcolor: '#f48fb1' }} >
            {channel}
        </List>
        );
    }


    render(){
        const excludeCurrentChats = this.state.users.filter((user) =>
            !this.state.chats.find((chat) => chat.displayName === user.username) && // only display users you dont already have dm with
            this.state.currentUser && (user.id !== this.state.currentUser.id)
        );

        const listUsers = excludeCurrentChats.map((user) => 
            <MenuItem key={user.id} value={user.id}>{user.username}</MenuItem>
        );

        return (
        <div>
            <Box sx={{ width: 250, bgcolor: '#e91e63', m:5 }}>
            <Typography variant="h5" component="div" align="center">
                Direct Messages
            </Typography>
            {this.renderChats()}
            </Box>
            <Dialog open={this.state.open} onClose={this.handleClose} >  {/*pop window for new dm */}
                <Box sx={{ bgcolor: '#f48fb1' }}>
                <DialogTitle>Direct Message</DialogTitle>
                <DialogContent style={{paddingTop:8}}>
                    <FormControl fullWidth>
                        <InputLabel>select</InputLabel>
                        <Select
                            label="Member"
                            onChange={this.handleChange}
                            value={`${this.state.selectedMember}`}
                            >
                            {listUsers}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose}>Cancel</Button>
                    <Button disabled={!this.state.selectedMember}
                            variant="contained" 
                            onClick={() => this.createDirectMessage()}>
                            Chat
                    </Button>
                </DialogActions>                
                </Box>
            </Dialog>
        </div>
        )
    }
}

export default DirectMessage