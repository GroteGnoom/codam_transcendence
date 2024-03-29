import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { IconButton, List, ListItem, ListItemText, TextField, Typography } from "@mui/material";
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import React from 'react';
import { get_backend_host } from '../utils';
import { Channel } from './Chat.types';

interface ChannelListProps {
    channelsWebSocket: any;
    openChat: any;
    activeChannel?: Channel;
    setError: (err: string) => void;
}

interface ChannelListState { 
    channels: Channel[];
    newChannel: string;
    newChannelType: string;
    newChannelPassword: string;
    open: boolean;
    passwordVisible: boolean;

    openJoinWindow: boolean;
    channelToJoin: any;
    passwordToJoin: string;
}

class ChannelList extends React.Component<ChannelListProps, ChannelListState> {

    constructor(props: any) {
        super(props);
        this.state = { 
            channels: [], 
            newChannel: "",
            newChannelType: "public",
            newChannelPassword: "",
            open: false,
            passwordVisible: false,

            openJoinWindow: false,
            channelToJoin: undefined,
            passwordToJoin: "",
        };
    }

    async getChannels() {
		return await fetch(get_backend_host() + "/channels", { 
            method: 'GET',
            credentials: 'include',
        })
        .then(async (response) => {
            const json = await response.json();
            if (response.ok) {
                return json;
            } else {
                throw new Error(json.message)                
            }
        })
        .then((response) => {
            this.setState({ channels: response });
        })
        .catch((err: Error) => {
            this.props.setError(err.message)
        })
	}

    async newchannel() {
		return await fetch(get_backend_host() + "/channels", { 
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type':'application/json'},
			body: JSON.stringify({
                "name": this.state.newChannel.trim(),
                "channelType": this.state.newChannelType,
                "password": this.state.newChannelPassword,
			})  
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
        .then( () => this.getChannels() )
        .catch((err: Error) => {
            this.props.setError(err.message)
        })
	}

    async isMember(channelname: string) {
		return await fetch(get_backend_host() + `/channels/${channelname}/is-member`, { 
            method: 'GET',
            credentials: 'include',
        })
        .then((response) => response.json())
	}

    async joinChannel() {
        return await fetch(get_backend_host() + `/channels/${this.state.channelToJoin.name}/join`, { 
            method: 'PUT',
            credentials: 'include',
            headers: {'Content-Type':'application/json'},
			body: JSON.stringify({
                "password": this.state.passwordToJoin,
			})  
        })
		.then(async (response) => {
            const json = await response.json();
            if (response.ok) {
                return json;
            } else {
                throw new Error(json.message)                
            }
        })            
        .then( () => this.getChannels() )
        .then( () => {
            this.setState( {openJoinWindow: false} ) 
            this.props.openChat(this.state.channelToJoin)
        })
        .catch((err: Error) => {
            this.props.setError(err.message)
        })
        
    }

    async tryToOpenChat(channel: Channel) {
        const member = await this.isMember(channel.name);
        console.log("Is member?", member)
        if (member) {
            this.props.openChat(channel);
        } else {
            const channelToJoin = this.state.channels.find((el) => el.name === channel.name)
            this.setState({channelToJoin: channelToJoin})
            this.setState({openJoinWindow: true})
        }
    }

    subscribeWebsocketEvents(){
        this.props.channelsWebSocket.on("newChannel", () => {this.getChannels()});
    }

    handleClickOpen = () => {
        this.setState( {open: true} );
    };
    
    handleClose = () => {
        this.setState( {open: false} );
    };

    componentDidMount() {
        this.getChannels()
         //get notified when a new channel is created
        .then(() => this.subscribeWebsocketEvents())
    }

    renderChannels = () => {
        const channel = this.state.channels.map((el) => (
            <ListItem sx={ { height: 40 } } key={el.name}> 
                <ListItemButton selected={this.props.activeChannel && el.name===this.props.activeChannel.name} 
                    onClick={() => this.tryToOpenChat(el) }> {/* sets active channel */}
                    <ListItemText primary={el.name} />
                </ListItemButton>    
            </ListItem>
        ))  
        channel.push (
            <ListItem key="NEW">
            <ListItemButton onClick={this.handleClickOpen}>
                <ListItemText primary="add channel" />
                <ListItemAvatar>
                    <Avatar sx={{ width: 24, height: 24 }} >
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
        return (
        <div>
            <Box sx={{ width: 250, bgcolor: '#e91e63', m:5 }}>
            <Typography variant="h5" component="div" align="center">
                Channels
            </Typography>
            {this.renderChannels()}
            </Box>
            <Dialog open={this.state.open} onClose={this.handleClose} >  {/*pop window for new channel */}
                <Box sx={{ bgcolor: '#f48fb1' }}>
                <DialogTitle>Add a new channel</DialogTitle>
                <DialogContent>
                    <TextField
                        onChange={(event) => { this.setState({newChannel: event.target.value}) }}
                        value={this.state.newChannel}
                        autoFocus
                        inputProps={{ maxLength: 20 }}
                        margin="dense"
                        id="name"
                        label="Channel name"
                        type="text"
                        fullWidth
                        variant="standard"
                        color="primary"/>
                    <RadioGroup
                        row
                        value={this.state.newChannelType}
                        defaultValue="public"
                        onChange={(event) => { this.setState({newChannelType: event.target.value}) }}
                        aria-labelledby="demo-row-radio-buttons-group-label"
                        name="row-radio-buttons-group">
                        <FormControlLabel value="public" control={<Radio />} label="public" />
                        <FormControlLabel value="private" control={<Radio />} label="private" />
                        <FormControlLabel value="protected" control={<Radio />} label="protected" />
                    </RadioGroup>
                    {this.state.newChannelType === 'protected' && 
                        <TextField
                            onChange={(event) => { this.setState({newChannelPassword: event.target.value}) }}
                            autoFocus
                            value={this.state.newChannelPassword}
                            inputProps={{ maxLength: 20 }}
                            margin="dense"
                            id="name"
                            label="Password"
                            type={this.state.passwordVisible ? "text" : "password"}
                            fullWidth
                            variant="standard"
                            InputProps={{
                                endAdornment: (
                                <IconButton onClick={() => this.setState({passwordVisible :!this.state.passwordVisible})}
                                    aria-label="send"
                                    color="secondary">
                                    <VisibilityIcon />
                                </IconButton>
                                ),
                            }}
                        />
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose}>Cancel</Button>
                    <Button variant="contained" onClick={() => this.newchannel()}>Add</Button>
                </DialogActions>                
                </Box>
            </Dialog>
            <Dialog open={this.state.openJoinWindow} onClose={() => this.setState({openJoinWindow: false})} >  {/*pop window for joining channel */}
                <Box sx={{ bgcolor: '#f48fb1' }}>
                <DialogTitle>Join {this.state.channelToJoin && this.state.channelToJoin.name}</DialogTitle>
                {this.state.channelToJoin && this.state.channelToJoin.channelType === 'protected' && <DialogContent>
                    <TextField
                        onChange={(event) => { this.setState({passwordToJoin: event.target.value}) }}
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Password"
                        type="password"
                        fullWidth
                        variant="standard"/>
                </DialogContent>}
                <DialogActions>
                    <Button onClick={() => this.setState({openJoinWindow: false})}>Cancel</Button>
                    <Button variant="contained" onClick={() => this.joinChannel()}>JOIN</Button>
                </DialogActions>                
                </Box>
            </Dialog>
        </div>
        )
    }
}

export default ChannelList