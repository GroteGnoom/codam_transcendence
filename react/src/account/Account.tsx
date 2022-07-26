import react from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Icon from '@mui/material/Icon'; //TODO: add icon
import { pink } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Alert } from "@mui/material";
import './Account.css'
import { InputLabel } from '@mui/material';
import PersonOutlineSharpIcon from '@mui/icons-material/PersonOutlineSharp';
import { getEffectiveConstraintOfTypeParameter } from 'typescript';

const pinkTheme = createTheme({ palette: { primary: pink } })

class Account extends react.Component<{}, { users:[], username: string, intraName: string, isActive: boolean, error: string }> { //set the props to empty object, and set the state to {vars and types}
    constructor(props: any) {
        super(props);
        this.state = {
            users: [],
            username: "",
            intraName: "lbisscho",
            isActive: true,
            error: ""
        }
        this.keyPress = this.keyPress.bind(this);
        this.getIntraName();
    }

    async createUser() {
        console.log("try create user...");
        console.log("current users");
        console.log(this.getUsers());
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

    async getUser() {
        // return await fetch(`http://127.0.0.1:5000/users/id/${this.state.user.id}`, {
        return await fetch("http://127.0.0.1:5000/users/id/1", {
            method: "GET" })
        .then((response) => response.json())
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

    async getUsers () {
        return await fetch("http://127.0.0.1:5000/users", {
            method: "GET"} )
        .then((response) => response.json())
        .catch((err: Error) => this.setState({error: err.message}))
    }

    keyPress(e: any){
        if(e.keyCode == 13){
            console.log('enter pressed');
            this.createUser()
        }
    }

    async getIntraName () { //TODO: doesnt work yet: Unexpected token h in JSON at position 0
        return await fetch("http://127.0.0.1:5000/auth/ft/profile", {
            method: "GET"} )
        .then((response) => response.json())
        .then((response) => {
            this.setState({ intraName: response })
        })
        .catch((err: Error) => this.setState({error: err.message}))
    }

    render(){ // holds the HTML code
        console.log(this.state.username);
        // console.log(this.state.intraName);

        return (
            // render user etc. when database is updated!
            <html>
                <body>
                    <ThemeProvider theme={pinkTheme}>
                        <div className="menu">
                                <TextField className="item"
                                    disabled defaultValue={this.state.intraName} id="filled-basic" label="Intraname" variant="filled" />
                                <TextField className="item"
                                    helperText="Please enter your username" id="filled-basic" label="Username" variant="filled" required
                                    onKeyDown={this.keyPress}
                                    onChange={(e) => this.setState({username: e.target.value})} />
                                <Button className="item"
                                    variant="contained"
                                    startIcon={<PersonOutlineSharpIcon />}
                                    onClick={(e) => this.createUser()}
                                > SIGN UP </Button>

                        </div>
                        <Dialog open={this.state.error !== ""} >  {/*pop window for new error message */}
                        <DialogTitle>Error</DialogTitle>
                        <DialogContent>
                            <Alert severity="error">
                                {this.state.error}
                            </Alert>
                        </DialogContent>
                        <DialogActions>
                            <Button variant="contained" onClick={() => this.setState({error: ""})}>OK</Button>
                        </DialogActions>
                        </Dialog>
                    </ThemeProvider>
                </body>
            </html>
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