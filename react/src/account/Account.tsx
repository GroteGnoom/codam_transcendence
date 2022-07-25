import react from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Icon from '@mui/material/Icon';
import { pink } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Alert } from "@mui/material";


const pinkTheme = createTheme({ palette: { primary: pink } })

class Account extends react.Component<{}, {users:[], username: string, intraName: string, isActive: boolean, error: string}> { //set the props to empty object, and set the state to {name: string}
    constructor(props: any) {
        super(props);
        this.state = {
            users: [],
            username: "default",
            intraName: "bla",
            isActive: true,
            error: ""
        }
    }

    async createUser() {
        console.log("try create user...");
        return await fetch("http://127.0.0.1:5000/users/create", {
            method: "POST",
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                "username": this.state.username,
                "intraName": this.state.intraName,
                "isActive": this.state.isActive
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
        .then((response) => response.json())
        .then((response) => {
            this.setState({ users: response })
        })
        .catch((err: Error) => this.setState({error: err.message}))
    }

    async changeUsername () {
        return await fetch("http://127.0.0.1:5000/users/setusername", {
            method: "POST",
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                "username": this.state.username
            })
        })
	}

    async changeIntraName () {
        return await fetch("http://127.0.0.1:5000/users/setusername", {
            method: "POST",
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                "username": this.state.username
            })
        })
	}

    async getUsers () {
        return await fetch("http://127.0.0.1:5000/users", { method: "GET"} )
        .then((response) => response.json())
    }

    render(){ // holds the HTML code
        console.log(this.state.users);

        return (
            // render user etc. when database is updated!
            <ThemeProvider theme={pinkTheme}>
                <div>
                    <TextField id="filled-basic" label="Username" variant="filled" onChange={(e) => this.setState({username: e.target.value})} />
                    <Button
                        variant="contained"
                        startIcon={<Icon />}
                        onClick={(e) => this.changeUsername()}
                    />
                </div>
                <div>
                    <TextField id="filled-basic" label="IntraName" variant="filled" onChange={(e) => this.setState({intraName: e.target.value})} />
                    <Button
                        variant="contained"
                        startIcon={<Icon />}
                        onClick={(e) => this.changeIntraName()}
                    />
                </div>
                <div>
                    <Button
                        variant="contained"
                        startIcon={<Icon />}
                        onClick={(e) => this.createUser()}
                    > Create new user! </Button>
                </div>
                <Dialog open={this.state.error !== ""} >  {/*pop window for new error message */}
                <DialogTitle>Ohh noooss</DialogTitle>
                <DialogContent>
                    <Alert severity="error">
                        {this.state.error}
                    </Alert>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => this.setState({error: ""})}>I'm sorry</Button>
                </DialogActions>
            </Dialog>
            </ThemeProvider>
        )
    }
}
        
export default Account;
        
        // {/* <form>
        // <label>Enter your name:
        //     <input type="text"
        //     onChange={(e) => this.setState({username: e.target.value})}
        //     />
        // </label>
        // </form> */}