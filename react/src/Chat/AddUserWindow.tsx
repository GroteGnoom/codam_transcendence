import { MenuItem } from "@mui/material";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import React from 'react';

interface AddUserWindowProps { 
    open: boolean;
    handleClose: () => void;
    activeChannel: string;
}

interface AddUserWindowState { 
    users: any[];
    currentMembers: number[];
    selectedMember: number;
}

class AddUserWindow extends React.Component<AddUserWindowProps, AddUserWindowState> {
    constructor(props: AddUserWindowProps){
        super(props);
        this.state = { 
            users: [], // array of user entities
            currentMembers: [],
            selectedMember: 0,
        }
    }

    async getUsers(){
        fetch(`http://127.0.0.1:5000/users`, { method: 'GET'})
		.then((response) => response.json())
        .then((response) => {
            this.setState({ users: response });            
        })
    }

    async getCurrentMembers(){
        fetch(`http://127.0.0.1:5000/channels/${this.props.activeChannel}`, { method: 'GET'})
		.then((response) => response.json())
        .then((response) => {
            this.setState({ currentMembers: response.members.map((user: any) => user.id) });            
        })
    }

    async addMember() {
		return await fetch(`http://127.0.0.1:5000/channels/${this.props.activeChannel}/member/${this.state.selectedMember}`, { 
            method: 'PUT'
        })
		.then((response) => response.json())
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

        const listUsers = nonMembers.map((user, index) => 
            <MenuItem key={user.id} value={user.id}>{user.username}</MenuItem>
        );
        
        return (
            <Dialog open={this.props.open} onClose={this.props.handleClose}>  {/*pop window to add user to channel */}
                <DialogTitle>Add Member</DialogTitle>
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
                    <Button onClick={this.props.handleClose}>Cancel</Button>
                    <Button variant="contained" onClick={() => this.addMember()}>Add</Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default AddUserWindow