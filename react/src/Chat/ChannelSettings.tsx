import React from 'react';
import { AppBar, Toolbar, Container, Divider, FormControl, Grid, IconButton, List, ListItem, ListItemText, Paper, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Fragment } from "react";
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { StringLiteral } from 'typescript';


interface ChannelSettingsProps { 
    channel?: string;
    openSettings: any;
}

interface ChannelSettingsState { 
    settings: any;
    passwordVisible: boolean;
}

class ChannelSettings extends React.Component<ChannelSettingsProps, ChannelSettingsState> {

    constructor(props: ChannelSettingsProps){
        super(props);
        this.state = { 
            settings: {},
            passwordVisible: false, 
        }
    }

    async getSettings(){
        return await fetch(`http://127.0.0.1:5000/channels/${this.props.channel}`, { method: 'GET'})
		.then((response) => response.json())
        .then((response) => {
            this.setState({ settings: response });
        })
    }

    async saveSettings() {
        return await fetch("http://127.0.0.1:5000/channels", { 
            method: 'POST',
            headers: {'Content-Type':'application/json'},
			body: JSON.stringify( this.state.settings)
        })
		.then(async (response) => {
            const json = await response.json();
            if (response.ok) {
                return json;
            } else {
                throw new Error(json.message)                
            }
        })            
        .then( () => this.props.openSettings(false) )
        // .catch((err: Error) => this.setState({error: err.message}))
    }

    componentDidMount() {
        this.getSettings()
    }



    render(): React.ReactNode {
        return (
            <Dialog open={true} fullScreen>  {/*pop window for settings */}
                <AppBar sx={{ position: 'relative', bgcolor: '#f06292' }}>
                    <Toolbar>
                        <IconButton
                        edge="start"
                        color="inherit"
                        onClick={() => this.props.openSettings(false)}
                        >
                        <CloseIcon />
                        </IconButton>
                        <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                        Settings
                        </Typography>
                        <Button autoFocus color="inherit" onClick={() => this.saveSettings()}>
                            save
                        </Button>
                    </Toolbar>
                </AppBar>
                
                {this.state.settings != {} && <Box sx={{ bgcolor: '#f48fb1' }}>
                    <DialogContent>
                        <TextField
                            disabled
                            onChange={(event) => {  }}
                            value={this.props.channel}
                            autoFocus
                            margin="dense"
                            id="name"
                            label="Channel name"
                            type="text"
                            fullWidth
                            variant="standard"/>
                        <RadioGroup
                            row
                            value={this.state.settings.channelType}
                            onChange={(event) => { this.setState({ settings: { ...this.state.settings, channelType: event.target.value} }) }}
                            aria-labelledby="demo-row-radio-buttons-group-label"
                            name="row-radio-buttons-group">
                            <FormControlLabel 
                                checked={this.state.settings.channelType == "public"} 
                                value="public" control={<Radio />} label="public" />
                            <FormControlLabel 
                                checked={this.state.settings.channelType == "private"} 
                                value="private" control={<Radio />} label="private" />
                            <FormControlLabel 
                                checked={this.state.settings.channelType == "protected"} 
                                value="protected" control={<Radio />} label="protected" />
                        </RadioGroup>
                        {this.state.settings.channelType === 'protected' && <TextField
                            onChange={(event) => { this.setState({ settings: { ...this.state.settings, password: event.target.value} }) }}
                            autoFocus
                            value={this.state.settings.password}
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
                </Box>}
            </Dialog>
        )
    }
}

export default ChannelSettings