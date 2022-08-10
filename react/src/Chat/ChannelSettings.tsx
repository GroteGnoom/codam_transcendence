import CloseIcon from '@mui/icons-material/Close';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { AppBar, IconButton, List, ListItem, ListItemAvatar, ListItemText, Stack, TextField, Toolbar, Typography } from "@mui/material";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import ListItemButton from '@mui/material/ListItemButton';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { Box } from "@mui/system";
import * as React from 'react';
import { ListChildComponentProps } from 'react-window';
import { Channel } from './Chat.types';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import ButtonGroup from '@mui/material/ButtonGroup';
import { get_backend_host } from '../utils';

interface ChannelSettingsProps {
    channel: Channel;
    openSettings: any;
    setError: (err: string) => void;    
    openChat: any;
}

interface ChannelSettingsState {
    settings: Channel;
    owner: any;
    passwordVisible: boolean;
    memberSettingsOpen: boolean;
    adminSettingsOpen: boolean;
    activeMember: any;
}

class ChannelSettings extends React.Component<ChannelSettingsProps, ChannelSettingsState> {
    constructor(props: ChannelSettingsProps) {
        super(props);
        this.state = {
            settings: {name: '', owner: 0, admins: [], members: [], password: "", channelType: ""},
            owner: {username: ''},
            passwordVisible: false,
            memberSettingsOpen: false,
            adminSettingsOpen: false,
            activeMember: undefined,
        }
    }

    async getSettings() {
        return await fetch(get_backend_host() + `/channels/${this.props.channel.name}`, { 
            method: 'GET',
            credentials: 'include',
        })
            .then((response) => response.json())
            .then((response) => {
                this.setState({ settings: response });
                this.getOwner(response.owner)
            })
    }

    async getOwner(id: number) {
        return await fetch(get_backend_host() + `/users/id/${id}`, { 
            method: 'GET',
            credentials: 'include',
        })
            .then((response) => response.json())
            .then((response) => {
                this.setState({ owner: response });
            })
    }

    async saveSettings() {
        return await fetch(get_backend_host() + `/channels/update/${this.props.channel.name}`, { // todo make update endpoint
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.state.settings)
            })
            .then(async (response) => {
                const json = await response.json();
                if (response.ok) {
                    return json;
                } else {
                    throw new Error(json.message)
                }
            })
            .then(() => this.props.openSettings(false))
            .catch((err: Error) => {
                this.props.setError(err.message)
            })
    }

    async leaveChannel() {
		return await fetch(get_backend_host() + `/channels/${this.props.channel.name}/member/self`, {  
            method: 'DELETE',
            credentials: 'include'
        })
        .then(async (response) => {
            const json = await response.json();
            if (response.ok) {
                return json;
            } else {
                throw new Error(json.message)
            }
        })        
        .then(() => {
            this.props.openSettings(false)
            this.props.openChat(undefined) // close the underlying ChatWindow
        }) //skips this step when error is thrown
        .catch((err: Error) => {
            this.props.setError(err.message)
        })
    }

    handleClose = () => {
        this.setState( {memberSettingsOpen: false} );
        this.setState( {adminSettingsOpen: false} );
        this.getSettings();
    };

    componentDidMount() {
        this.getSettings()
    }
     
    renderRow = (props: ListChildComponentProps) => {
        const { index, style } = props;
      
        return (
          <ListItem style={style} key={index} component="div" disablePadding>
            <ListItemButton>
              <ListItemText primary={`${this.state.settings.members[index].username}`} />
            </ListItemButton>
          </ListItem>
        );
      }

    renderMembers = () => {
    const members = this.state.settings.members.map((el) => (
            <ListItem key={el.id}> 
                <ListItemText 
                    primary={`${el.user.username}`}
                />
                {el.isMuted && <ListItemAvatar>
                    <VolumeOffIcon/>
                </ListItemAvatar>}
                <IconButton onClick={() => {
                                this.setState( {memberSettingsOpen: true} ); 
                                this.setState( {activeMember: el.user} )}
                                } color="secondary">
                    <MoreHorizIcon />
                </IconButton>               
            </ListItem>
        ))  
        return (
            <List sx={{width: '100%', maxWidth: 250, bgcolor: '#f06292' }}>
                {members}
            </List>
        );
    }

    renderAdmins = () => {
        const admins = this.state.settings.admins.map((el) => (
            <ListItem key={el.id}> 
                <ListItemText 
                    primary={`${el.username}`} 
                    /> 
                <IconButton onClick={() => {
                                this.setState( {adminSettingsOpen: true} ); 
                                this.setState( {activeMember: el} )}
                                } color="secondary">
                    <MoreHorizIcon />
                </IconButton>                   
            </ListItem>
        ))  
        return (
            <List sx={{width: '100%', maxWidth: 250, bgcolor: '#f06292' }} >
                {admins}
            </List>
        );
    }

    renderOwner = () => {

        return (
            <Box sx={{width: '100%', maxWidth: 250, bgcolor: '#f06292', mb:5 }} >
                {this.state.owner.username}
            </Box>  
        );
    }
    
    render() {
        return (
            <Dialog open={true} fullScreen PaperProps={{ sx:{ bgcolor: '#f48fb1' } }}>  {/*pop window for settings */}
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

                {this.state.settings && <Stack sx={{ bgcolor: '#f48fb1' }} direction='row'>
                    <DialogContent>
                        <TextField
                            disabled
                            onChange={(event) => { }}
                            value={this.props.channel.name}
                            inputProps={{ maxLength: 20 }}
                            autoFocus
                            margin="dense"  
                            id="name"
                            label="Channel name"
                            type="text"
                            variant="standard" />
                        <RadioGroup
                            row
                            value={this.state.settings.channelType}
                            onChange={(event) => { this.setState({ settings: { ...this.state.settings, channelType: event.target.value } }) }}
                            aria-labelledby="demo-row-radio-buttons-group-label"
                            name="row-radio-buttons-group">
                            <FormControlLabel
                                checked={this.state.settings.channelType === "public"}
                                value="public" control={<Radio />} label="public" />
                            <FormControlLabel
                                checked={this.state.settings.channelType === "private"}
                                value="private" control={<Radio />} label="private" />
                            <FormControlLabel
                                checked={this.state.settings.channelType === "protected"}
                                value="protected" control={<Radio />} label="protected" />
                        </RadioGroup>
                        {this.state.settings.channelType === 'protected' && <TextField
                            onChange={(event) => { this.setState({ settings: { ...this.state.settings, password: event.target.value } }) }}
                            autoFocus
                            value={this.state.settings.password}
                            inputProps={{ maxLength: 20 }}
                            margin="dense"
                            id="name"
                            label="Password"
                            type={this.state.passwordVisible ? "text" : "password"}
                            fullWidth
                            variant="standard"
                            InputProps={{
                                endAdornment: (
                                    <IconButton onClick={() => this.setState({ passwordVisible: !this.state.passwordVisible })}
                                        aria-label="send"
                                        color="secondary">
                                        <VisibilityIcon />
                                    </IconButton>
                                ),
                            }}/>
                        }
                        <Typography sx={{ flex: 1 }} variant="h6" component="div">
                            Owner
                        </Typography>
                        {this.renderOwner()}
                        <Button variant="contained" onClick={() => this.leaveChannel()} >
                            Leave Channel    
                        </Button>                      
                    </DialogContent>
                    <DialogContent>                      
                        <Typography sx={{ flex: 1 }} variant="h6" component="div">
                            Members
                        </Typography>
                        {this.renderMembers()}
                        <MemberSettings open={this.state.memberSettingsOpen}
                                        handleClose={this.handleClose}
                                        member={this.state.activeMember}
                                        activeChannel={this.props.channel.name}
                                        setError={this.props.setError} />
                        <Typography sx={{ flex: 1 }} variant="h6" component="div">
                            Admins
                        </Typography>
                        {this.renderAdmins()}
                        <AdminSettings  open={this.state.adminSettingsOpen}
                                        handleClose={this.handleClose}
                                        member={this.state.activeMember}
                                        activeChannel={this.props.channel.name}
                                        setError={this.props.setError} />
                    </DialogContent>
                </Stack>}
            </Dialog>
        )
    }
}

export default ChannelSettings


// ---------------------------------------------------------------------------------------


interface MemberSettingsProps { 
    open: boolean;
    handleClose: any;
    member: any;
    activeChannel: string;
    setError: any;
}

interface MemberSettingsState {}


class MemberSettings extends React.Component<MemberSettingsProps, MemberSettingsState> {

    constructor(props: MemberSettingsProps) {
        super(props);
        this.state = {} 
    }

    async removeMember() {
		return await fetch(get_backend_host() + `/channels/${this.props.activeChannel}/member/${this.props.member.id}`, {  
            method: 'DELETE',
            credentials: 'include'
        })
        .then(async (response) => {
            const json = await response.json();
            if (response.ok) {
                return json;
            } else {
                throw new Error(json.message)
            }
        })
        .catch((err: Error) => {
            this.props.setError(err.message)
        })
        .then( () => this.props.handleClose() )
	}

    async muteMember() {
        return await fetch(get_backend_host() + `/channels/${this.props.activeChannel}/mute/${this.props.member.id}`, {
            method: 'PUT',
            credentials: 'include'
        })
        .then(async (response) => {
            const json = await response.json();
            if (response.ok) {
                return json;
            } else {
                throw new Error(json.message)
            }
        })
        .catch((err: Error) => {
            this.props.setError(err.message)
        })
        .then( () => this.props.handleClose() )
    }

    async banMember(){
        return await fetch(get_backend_host() + `/channels/${this.props.activeChannel}/ban/${this.props.member.id}`, { 
            method: 'PUT',
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
        .catch((err: Error) => {
            this.props.setError(err.message)
        })
        .then( () => this.props.handleClose() )
    }

    async createAdmin() {
		return await fetch(get_backend_host() + `/channels/${this.props.activeChannel}/admin/${this.props.member.id}`, { 
            method: 'PUT',
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
        .catch((err: Error) => {
            this.props.setError(err.message)
        })
        .then( () => this.props.handleClose() )
	}

    componentDidMount() { 
        console.log("member settings")
    }

    render() {
        const buttons = [
            <Button color="secondary" onClick={() => { this.removeMember() }} key="kick">Kick</Button>,
            <Button color="secondary" onClick={() => { this.muteMember() }} key="mute">Mute</Button>,
            <Button color="secondary" onClick={() => { this.banMember() }} key="ban">Ban</Button>,
            <Button color="secondary" onClick={() => { this.createAdmin() }} key="make-admin">Promote Admin</Button>,
          ];
        
        return (
            <Dialog open={this.props.open} >
                <DialogTitle>{this.props.member && this.props.member.username} Settings</DialogTitle>
                <DialogContent>          
                <Box>
                    <ButtonGroup
                        orientation="vertical">
                        {buttons}
                    </ButtonGroup>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.props.handleClose}>Cancel</Button>
                </DialogActions>
            </Dialog>
        );
    }
}


// ---------------------------------------------------------------------------------------


interface AdminSettingsProps { 
    open: boolean;
    handleClose: any;
    member: any;
    activeChannel: string;
    setError: any;
}

interface AdminSettingsState {}

class AdminSettings extends React.Component<AdminSettingsProps, AdminSettingsState> {

    constructor(props: MemberSettingsProps) {
        super(props);
        this.state = {} 
    }

    async demoteAdmin() {
		return await fetch(get_backend_host() + `/channels/${this.props.activeChannel}/admin/${this.props.member.id}`, { 
            method: 'DELETE',
            credentials: 'include'
        })
        .then(async (response) => {
            const json = await response.json();
            if (response.ok) {
                return json;
            } else {
                throw new Error(json.message)
            }
        })
        .catch((err: Error) => {
            this.props.setError(err.message)
        })
        .then( () => this.props.handleClose() )
	}

    componentDidMount() { 
        console.log("admin settings")
    }

    render() {
        const buttons = [
            <Button color="secondary" onClick={() => { this.demoteAdmin() }} key="demote-admin">Demote Admin</Button>,
          ];
        
        return (
            <Dialog open={this.props.open} >
                <DialogTitle>{this.props.member && this.props.member.username} Settings</DialogTitle>
                <DialogContent>          
                <Box>
                    <ButtonGroup
                        orientation="vertical">
                        {buttons}
                    </ButtonGroup>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.props.handleClose}>Cancel</Button>
                </DialogActions>
            </Dialog>
        );
    }
}
