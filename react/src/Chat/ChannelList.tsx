import React, { useState } from 'react';
import Button from '@mui/material/Button';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import AddIcon from '@mui/icons-material/Add';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ButtonGroup from '@mui/material/ButtonGroup';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import StarIcon from '@mui/icons-material/Star';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';


interface ChannelListProps { 
    openChat: any;
}

interface ChannelListState { 
    channels: any[];
    newChannel: string;
    open: boolean;
}

class ChannelList extends React.Component<ChannelListProps, ChannelListState> {
    constructor(props: any) {
        super(props);
        this.state = { 
            channels: [], 
            newChannel: "",
            open: false,
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
                "owner": 7
			})  
        })
		.then((response) => response.json())
        .then( () => this.handleClose() )
        .then( () => this.getChannels() )
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
            <ListItem sx={ { height: 40 } }> 
                <ListItemButton onClick={() => this.props.openChat(el.name)}> {/* sets active channel */}
                    <ListItemText primary={el.name} />
                </ListItemButton>    
                {/* <button onClick={() => this.openSettings(el)}>Settings</button>    */}
            </ListItem>
        ))
        channel.push (            
            <ListItem >
            <ListItemButton onClick={this.handleClickOpen}>
                <ListItemText primary="add channel" />
            </ListItemButton>
            <ListItemAvatar>
                <Avatar sx={{ width: 24, height: 24 }}>
                    <AddIcon fontSize='small'/>
                </Avatar>
            </ListItemAvatar>
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
            <Box sx={{ width: 250, border: 1, bgcolor: '#ec407a', m:5 }}>
            <Typography variant="h5" component="div" align="center">
                Channels
            </Typography>
            {this.renderChannels()}
            </Box>
            <Dialog open={this.state.open} onClose={this.handleClose}>
                <DialogTitle>Add a new channel</DialogTitle>
                <DialogContent>
                    <TextField
                    onChange={(event) => { this.setState({newChannel: event.target.value}) }}
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Channel name"
                    type="text"
                    fullWidth
                    variant="standard"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose}>Cancel</Button>
                    <Button variant="contained" onClick={() => this.newchannel()}>Add</Button>
                </DialogActions>
            </Dialog>
        </div>
        )
    }
}

export default ChannelList