import React, { useState } from 'react';
import Button from '@mui/material/Button';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import AddIcon from '@mui/icons-material/Add';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import ListItemButton from '@mui/material/ListItemButton';
import Box from '@mui/material/Box';
import { Alert, List, ListItem, ListItemText, TextField, IconButton, Typography } from "@mui/material";

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Channel } from './Chat.types';


interface ChannelListProps { 
    openChat: any;
    activeChannel?: string;
    setError: (err: string) => void;
}

interface ChannelListState { 
    channels: Channel[];
    newChannel: string;
    newChannelType: string;
    newChannelPassword: string;
    open: boolean;
    passwordVisible: boolean;
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
        };
    }

    componentDidMount() {
        this.getChannels()
    }

    // Backend calls
    async getChannels() {
		return await fetch("http://127.0.0.1:5000/channels", { method: 'GET'})
		.then((response) => response.json())
        .then((response) => {
            this.setState({ channels: response });
        })
	}

    async newchannel() {
		return await fetch("http://127.0.0.1:5000/channels", { 
            method: 'POST',
            headers: {'Content-Type':'application/json'},
			body: JSON.stringify({
                "name": this.state.newChannel,
                "channelType": this.state.newChannelType,
                "password": this.state.newChannelPassword,
                "owner": 7
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

    //Helpers
    handleClickOpen = () => {
        this.setState( {open: true} );
    };
    
    handleClose = () => {
        this.setState( {open: false} );
    };

    renderChannels = () => {
        const channel = this.state.channels.map((el) => (
            <ListItem sx={ { height: 40 } } key={el.name}> 
                <ListItemButton selected={el.name==this.props.activeChannel} 
                    onClick={() => this.props.openChat(el.name)}> {/* sets active channel */}
                    <ListItemText primary={el.name} />
                </ListItemButton>    
            </ListItem>
        ))  
        channel.push (            
            <ListItem key="NEW">
            <ListItemButton onClick={this.handleClickOpen}>
                <ListItemText primary="add channel" />
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

            // <div>
            //     <h2>Channels</h2>
            //     <ButtonGroup
            //         orientation="vertical"
            //         aria-label="vertical contained button group"
            //         variant="text"
            //         >
            //         {channel}
            //     </ButtonGroup>
            // </div>
    }

    render(){
        return (
        <div>
            <Box sx={{ width: 250, bgcolor: '#ec407a', m:5 }}>
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
                        margin="dense"
                        id="name"
                        label="Channel name"
                        type="text"
                        fullWidth
                        variant="standard"/>
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
                    {this.state.newChannelType === 'protected' && <TextField
                        onChange={(event) => { this.setState({newChannelPassword: event.target.value}) }}
                        autoFocus
                        value={this.state.newChannelPassword}
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
        </div>
        )
    }
}

export default ChannelList