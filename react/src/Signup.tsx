import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { pink } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Alert } from "@mui/material";
import './Signup.css'
// import { InputLabel } from '@mui/material';
import PersonOutlineSharpIcon from '@mui/icons-material/PersonOutlineSharp';
// import { createUnarySpacing } from '@mui/system';
import Avatar from '@mui/material/Avatar';
// import Menu from '@mui/material/Menu';
// import Box from '@mui/material/Box';
// import Badge from '@mui/material/Badge';

const pinkTheme = createTheme({ palette: { primary: pink } })

enum userStatus {
	Online = "online",
	Offline = "offline",
	InGame = "inGame",
}

export function Signup() {
    const [users, setUsers] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("default");
    const [intraName, setIntraName] = useState("default");
    const [status, setStatus] = useState(userStatus.Online);
    const [error, setError] = useState("");

    //backend calls
    async function getUserInfoDatabase () { // TODO: unexpected end of JSON input
        return await fetch("http://127.0.0.1:5000/users/intraname/", { 
            method: "GET",
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
            console.log("found intraname: " + response.intraName);
            console.log("found username: " + response.username);
            setIntraName(response.intraName);
            setUsername(response.username);
        })
        .catch((err: Error) => setError(err.message))
    }

    async function getLoggedIn () {
        return await fetch("http://127.0.0.1:5000/auth/amiloggedin/", { 
            method: "GET",
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
            setIsLoggedIn(response);
        })
        .catch((err: Error) => setError(err.message))
    }

    async function getUsers () {
        return await fetch("http://127.0.0.1:5000/users", {
            method: "GET"} )
        .then(async (response) => {
            const json = await response.json();
            if (response.ok) {
                return json;
            } else {
                throw new Error(json.message)
            }
        })
        .catch((err: Error) => setError(err.message))
    }

    async function createUser() {
        console.log("try create user...");
        console.log("current users");
        console.log(users);
        return await fetch("http://127.0.0.1:5000/users/create", {
            method: "POST",
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                "username": username,
                "intraName": intraName,
                "status": status
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
        .then((response) => {
            setUsers(response)
        })
        .catch((err: Error) => setError(err.message))
    }

    async function saveUser() {
        console.log("try save user...");
        console.log("current users");
        console.log(getUsers());
        return await fetch("http://127.0.0.1:5000/users/signupuser", {
            method: "PUT",
            credentials: 'include',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                "username": username,
                "intraName": intraName,
                "status": status
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
        .then((response) => {
            setUsers(response)
        })
        .catch((err: Error) => setError(err.message))
    }

    function keyPress(e: any) {
        if(e.key === 13){
            console.log('enter pressed');
            createUser();
        }
    }

    // effect hooks
    // combination of componentDidMount and componentDidUpdate
    useEffect(() => { // will be called after the DOM update (after render)
        console.log(username);
        console.log(intraName);
        getLoggedIn();
    });

    useEffect(() => {
        if ( isLoggedIn ) {
            getUserInfoDatabase();
        }
    }, [isLoggedIn]); // will only be called when isLoggedIn changes

    useEffect(() => {
        getLoggedIn();
    }, []); // will only be called on initial mount and unmount

    return ( // holds the HTML code
    <ThemeProvider theme={pinkTheme}>
                { isLoggedIn ? (
                    <div className="menu">
                        <Avatar className="item"
                            alt={intraName} // first letter of alt text is default avatar if loading src fails
                            src="https://upload.wikimedia.org/wikipedia/commons/6/6e/Mona_Lisa_bw_square.jpeg"
                            sx={{ width: 150, height: 150 }}
                        />
                        <TextField className="item"
                            disabled value={intraName || ''} id="filled-basic" label="Intraname" variant="filled" />
                        <TextField className="item"
                            value={username || ''}
                            helperText="Please enter a username" id="filled-basic" label="Username" variant="filled" required
                            onKeyDown={(e) => keyPress(e)}
                            onChange={(e) => setUsername(e.target.value)} />
                        <Button className="item"
                            variant="contained"
                            startIcon={<PersonOutlineSharpIcon />}
                            onClick={() => saveUser()}
                        > SIGN UP </Button>
                    </div>
                ) : (
                    <div className="menu">
                        <a href="http://127.0.0.1:5000/auth/ft"><Button className="button" variant="contained">Log in 42</Button></a>
                    </div>
                )}

            <Dialog open={error !== ""} >  {/*pop window for new error message */}
            <DialogTitle>Error</DialogTitle>
            <DialogContent>
                <Alert severity="error">
                    {error}
                </Alert>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={() => setError("")}>OK</Button> {/* TODO: enter to get out of dialog */}
            </DialogActions>
            </Dialog>
        </ThemeProvider>
    )
}

// class Account extends react.Component<{}, { users:[], username: string, intraName: any, status: userStatus, error: string }> { //set the props to empty object, and set the state to {vars and types}
//     constructor(props: any) {
//         super(props);
//         this.state = {
//             users: [],
//             username: "",
//             intraName: "",
//             status: userStatus.Online,
//             error: ""
//         }
//         this.keyPress = this.keyPress.bind(this);
//     }

//     async createUser() {
//         console.log("try create user...");
//         console.log("current users");
//         console.log(this.getUsers());
//         return await fetch("http://127.0.0.1:5000/users/create", {
//             method: "POST",
//             headers: {'Content-Type':'application/json'},
//             body: JSON.stringify({
//                 "username": this.state.username,
//                 "intraName": this.state.intraName,
//                 "status": this.state.status
//             })
//         })
//         .then(async (response) => {
//             const json = await response.json();
//             if (response.ok) {
//                 return json;
//             } else {
//                 throw new Error(json.message)
//             }
//         })
//         .then((response) => {
//             this.setState({ users: response })
//         })
//         .catch((err: Error) => this.setState({error: err.message}))
//     }

//     async getUser() {
//         // return await fetch(`http://127.0.0.1:5000/users/id/${this.state.user.id}`, {
//         return await fetch("http://127.0.0.1:5000/users/id/1", {
//             method: "GET" })
//         .then(async (response) => {
//             const json = await response.json();
//             if (response.ok) {
//                 return json;
//             } else {
//                 throw new Error(json.message)
//             }
//         })
//         .catch((err: Error) => this.setState({error: err.message}))
//     }

//     async changeUsername () {
//         return await fetch("http://127.0.0.1:5000/users/setusername", {
//             method: "POST",
//             headers: {'Content-Type':'application/json'},
//             body: JSON.stringify({
//                 "username": this.state.username
//             })
//         })
// 	}

//     async getUsers () {
//         return await fetch("http://127.0.0.1:5000/users", {
//             method: "GET"} )
//         .then(async (response) => {
//             const json = await response.json();
//             if (response.ok) {
//                 return json;
//             } else {
//                 throw new Error(json.message)
//             }
//         })
//         .catch((err: Error) => this.setState({error: err.message}))
//     }

//     keyPress(e: any){
//         if(e.keyCode == 13){
//             console.log('enter pressed');
//             this.createUser()
//         }
//     }

//     async getIntraName () { //TODO: doesnt work yet: 401 error
//         return await fetch("http://127.0.0.1:5000/users/intraname/", { 
//             method: "GET",
//             credentials: 'include',
//         })
//         .then(async (response) => {
//             const json = await response.json();
//             if (response.ok) {
//                 return json;
//             } else {
//                 throw new Error(json.message)
//             }
//         })
//         .then((response) => {
//             this.setState({ intraName: response.intraName })
//         })
//         .catch((err: Error) => this.setState({error: err.message}))
//     }

//     componentDidMount() {
//         this.getIntraName();
//     }

//     // TODO: instead of class use new react method => just functions + useState and not componentDidMount etc.
//     // https://reactjs.org/docs/hooks-effect.html
//     // Initial mount
//     // useEffect(() => {
//     //     getChannels()
//     // }, []);

//     // useEffect(() => {

//     // }, [channels])

//     render(){ // holds the HTML code
//         console.log(this.state.username);
//         console.log(this.state.intraName);

//         return (
//             // render user etc. when database is updated!
//             <ThemeProvider theme={pinkTheme}>
//                 <div className="menu">
//                         <TextField className="item"
//                             disabled defaultValue={this.state.intraName} id="filled-basic" label="Intraname" variant="filled" />
//                         <TextField className="item"
//                             helperText="Please enter a username" id="filled-basic" label="Username" variant="filled" required
//                             onKeyDown={this.keyPress}
//                             onChange={(e) => this.setState({username: e.target.value})} />
//                         <Button className="item"
//                             variant="contained"
//                             startIcon={<PersonOutlineSharpIcon />}
//                             onClick={(e) => this.createUser()}
//                         > SIGN UP </Button>

//                 </div>
//                 <Dialog open={this.state.error !== ""} >  {/*pop window for new error message */}
//                 <DialogTitle>Error</DialogTitle>
//                 <DialogContent>
//                     <Alert severity="error">
//                         {this.state.error}
//                     </Alert>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button variant="contained" onClick={() => this.setState({error: ""})}>OK</Button> {/* TODO: enter to get out of dialog */}
//                 </DialogActions>
//                 </Dialog>
//             </ThemeProvider>
//         )
//     }
// }
        
// export default Account;
        
//         // {/* <form>
//         // <label>Enter your name:
//         //     <input type="text"
//         //     onChange={(e) => this.setState({username: e.target.value})}
//         //     />
//         // </label>
//         // </form> */}