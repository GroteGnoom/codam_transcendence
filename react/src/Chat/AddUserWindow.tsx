import { ListItem, ListItemText, TextField } from "@mui/material";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import React, { Fragment } from 'react';

interface AddUserWindowProps { 
    open: boolean;
    setOpen: (open: boolean) => void
}

interface AddUserWindowState { 
    users: any[];
}

class AddUserWindow extends React.Component<AddUserWindowProps, AddUserWindowState> {
    private webSocket: any = undefined;

    constructor(props: AddUserWindowProps){
        super(props);
        this.state = { 
            users: [], 
        }
    }

    async getUsers(){
        return await fetch(`http://127.0.0.1:5000/users`, { method: 'GET'})
		.then((response) => response.json())
        .then((response) => {
            this.setState({ users: response });            
        })
    }
  
    componentDidMount() {
        console.log("updating")
        this.getUsers()
    }


    handleClose = () => {
        this.props.setOpen(false);
    };

    render() {
        const listUsers = this.state.users.map((user, index) => 
            <ListItem key={index}>
                <ListItemText 
                    primary={`${user.username}`} 
                    />
            </ListItem>
        );
        
        return (
            <Dialog open={this.props.open} onClose={this.handleClose}>  {/*pop window to add user to channel */}
                <DialogTitle>Add Member</DialogTitle>
                <DialogContent>
                    <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="User"
                    type="text"
                    fullWidth
                    variant="standard"
                    />
                    {listUsers}
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleClose}>Cancel</Button>
                    {/* <Button variant="contained" onClick={() => this.newchannel()}>Add</Button> */}
                </DialogActions>
            </Dialog>
        );
    }
}

export default AddUserWindow