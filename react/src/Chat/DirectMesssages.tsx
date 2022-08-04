import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, MenuItem, Select, SelectChangeEvent, TextField, Typography } from '@mui/material';
import React from 'react';
import { Channel } from './Chat.types';
import AddIcon from '@mui/icons-material/Add';


interface DirectMessageProps { 
    openChat: any;
    activeChannel?: Channel;
    setError: (err: string) => void;
}

interface DirectMessageState { 
    chats: Channel[];
    newChat: string;
    open: boolean;
    users: any[];
    selectedMember: number;
}

class DirectMessage extends React.Component<DirectMessageProps, DirectMessageState> {

    constructor(props: any) {
        super(props);
        this.state = { 
            chats: [], 
            newChat: "",
            open: false,
            users: [],
            selectedMember: 0,

            // openJoinWindow: false,
            // channelToJoin: undefined,
        };
    }

    componentDidMount() {
        console.log("direct messages")
        this.getUsers()
        this.getChats()
    }

    async getChats() {
		return await fetch("http://127.0.0.1:5000/channels/chats/direct-messages", { 
            method: 'GET',
            credentials: 'include',
        })
		.then((response) => response.json())
        .then((response) => {
            this.setState({ chats: response });
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
        console.log("selectedmember: ", this.state.selectedMember);
    };

    async getUsers(){
        fetch(`http://127.0.0.1:5000/users`, { method: 'GET'})
		.then((response) => response.json())
        .then((response) => {
            this.setState({ users: response });            
        })
    }

    async createDirectMessage() {
		return await fetch(`http://127.0.0.1:5000/channels/dm/${this.state.selectedMember}`, { 
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
                    <ListItemText primary={el.name} />
                </ListItemButton>    
            </ListItem>
        ))  
        channel.push (
            <ListItem key="NEW">
            <ListItemButton onClick={this.handleClickOpen}>
                <ListItemText primary="new chat" />
                <ListItemAvatar>
                    <Avatar sx={{ width: 24, height: 24 }}>
                        <AddIcon color='secondary' fontSize='small' sx={{ color: 'darkpink' }}/>
                    </Avatar>
                </ListItemAvatar>
            </ListItemButton>
            </ListItem>
        )

        return (
        <List sx={{width: '100%', maxWidth: 250, bgcolor: '#f06292' }} >
            {channel}
        </List>
        );
    }


    render(){
    // const nonMembers = this.state.users.filter((user) => 
    //     !this.state.currentMembers.includes(user.id)
    // );

    const listUsers = this.state.users.map((user) => 
        <MenuItem key={user.id} value={user.id}>{user.username}</MenuItem>
    );

        return (
        <div>
            <Box sx={{ width: 250, bgcolor: '#ec407a', m:5 }}>
            <Typography variant="h5" component="div" align="center">
                Direct Messages
            </Typography>
            {this.renderChats()}
            </Box>
            <Dialog open={this.state.open} onClose={this.handleClose} >  {/*pop window for new dm */}
                <Box sx={{ bgcolor: '#f48fb1' }}>
                <DialogTitle>Direct Message</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth>
                        <InputLabel>select</InputLabel>
                        <Select
                            label="Member"
                            onChange={this.handleChange}
                            >
                            {listUsers}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose}>Cancel</Button>
                    <Button variant="contained" onClick={() => this.createDirectMessage()}>Chat</Button>
                </DialogActions>                
                </Box>
            </Dialog>
        </div>
        )
    }
}

export default DirectMessage