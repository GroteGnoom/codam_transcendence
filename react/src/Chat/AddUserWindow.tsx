import { Box, MenuItem } from "@mui/material";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import React from 'react';
import { get_backend_host } from "../utils";

interface AddUserWindowProps { 
    open: boolean;
    handleClose: () => void;
    activeChannel: string;
    setError: any;
}

interface AddUserWindowState { 
    users: any[];
    currentMembers: number[];
    selectedMember: any;
}

class AddUserWindow extends React.Component<AddUserWindowProps, AddUserWindowState> {
    constructor(props: AddUserWindowProps){
        super(props);
        this.state = { 
            users: [], // array of user entities
            currentMembers: [],
            selectedMember: '',
        }
    }

    async getUsers(){
        fetch(get_backend_host() + `/users`, { method: 'GET', credentials: 'include'})
		.then((response) => response.json())
        .then((response) => {
            this.setState({ users: response });            
        })
    }

    async getCurrentMembers(){
        fetch(get_backend_host() + `/channels/${this.props.activeChannel}`, { method: 'GET', credentials: 'include'})
		.then((response) => response.json())
        .then((response) => {
            this.setState({ currentMembers: response.members.map((member: any) => member.user.id) });            
        })
    }

    async addMember() {
		return await fetch(get_backend_host() + `/channels/${this.props.activeChannel}/member/${this.state.selectedMember}`, { 
            method: 'PUT'
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
        .then(() => this.props.handleClose())
	}

    handleChange = (event: SelectChangeEvent) => {
        this.setState({selectedMember: Number(event.target.value)});
    };
  
    componentDidMount() {
        console.log("updating")
        this.getUsers()
        this.getCurrentMembers()
    }

    render() {
        const nonMembers = this.state.users.filter((user) => 
            !this.state.currentMembers.includes(user.id)
        );

        const listUsers = nonMembers.map((user) => 
            <MenuItem key={user.id} value={user.id}>{user.username}</MenuItem>
        );
        
        return (
            <Dialog open={this.props.open} onClose={this.props.handleClose}>  {/*pop window to add user to channel */}
                <Box sx={{ bgcolor: '#f48fb1' }}>
                <DialogTitle>Add Member</DialogTitle>
                <DialogContent style={{paddingTop:8}}>          
                    <FormControl fullWidth>
                        <InputLabel>select</InputLabel>
                        <Select
                            color="primary"
                            sx={{ bgcolor: '#f48fb1' }}
                            label="Member"
                            value={`${this.state.selectedMember}`}
                            onChange={this.handleChange}
                            >
                            {listUsers}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.props.handleClose}>Cancel</Button>
                    <Button disabled={!this.state.selectedMember} 
                            variant="contained"
                            onClick={() => this.addMember()}>
                        Add
                    </Button>
                </DialogActions>
                </Box>
            </Dialog>
        );
    }
}

export default AddUserWindow
