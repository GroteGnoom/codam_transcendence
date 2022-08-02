import './Signup.css'
import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { pink } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Alert, getAvatarGroupUtilityClass } from "@mui/material";
import PersonOutlineSharpIcon from '@mui/icons-material/PersonOutlineSharp';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Snackbar from '@mui/material/Snackbar';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import {styled} from '@mui/material/styles';
import FormData from 'form-data';
import {createReadStream} from 'fs';

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
    const [event, setEvent] = useState("");
    const [avatar, setAvatar] = useState("");

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
            setEvent("User created successfully")
        })
        .catch((err: Error) => setError(err.message))
    }

    async function getAvatar () {
        return await fetch("http://127.0.0.1:5000/users/avatar/", { 
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
        .catch((err: Error) => setError(err.message))
    }

    async function handleChange(e: any){
        console.log(e.target.files[0]);
        console.log(e.target.files[0].name);
        console.log(e.target.files[0].size);
        console.log(e.target.files[0].type);
    
        const file = e.target.files[0];
        const form = new FormData();
        form.append('file', file, file.name);
        console.log(form);
        console.log(typeof form);

        return await fetch("http://127.0.0.1:5000/users/avatar", {
            method: 'POST',
            credentials: 'include',
            body: form as any,
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
            setAvatar(response);
            // getAvatar();
        })
        .catch((err: Error) => setError(err.message))
        // try {
        //     const response = await fetch('http://localhost:5000/users/avatar', {
        //         method: 'POST',
        //         credentials: 'include',
        //         body: JSON.stringify(form as FormData),
        //     });
        //     if (!response.ok) {
        //         throw new Error(response.statusText);
        //     }
        //     console.log(response);
        // } catch (err) {
        //     console.log(err);
        // }
        // const fileStream = createReadStream(e.target.files[0].name);
        // form.append('photo', readStream);
        // form.append('firstName', 'Marcin');
        // form.append('lastName', 'Wanago');
    }

    function keyPress(e: any) {
        if(e.key === 13){
            console.log('enter pressed');
            createUser();
        }
    }

    function chooseAvatar(){ //TODO
        console.log("clicked!");
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
                        <Badge className="item"
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                                // Avatar to make the Icon circular
                                <Avatar
                                    style={{
                                        // border: '2px solid #fcc6ff', // not needed with avatar
                                        backgroundColor: '#fcc6ff'
                                    }}>
                                        <Button
                                            component="label"
                                        >
                                            <input
                                                type="file"
                                                accept="image/*"
                                                hidden
                                                onChange={(e) => handleChange(e)}                                              
                                            />
                                            <ChangeCircleIcon
                                                fontSize='large'
                                                onClick={() => chooseAvatar()}
                                            />
                                        </Button>
                                </Avatar>
                            }
                            >
                            <Avatar className="item"
                                alt={intraName} // first letter of alt (alternative) text is default avatar if loading src fails
                                src="https://upload.wikimedia.org/wikipedia/commons/6/6e/Mona_Lisa_bw_square.jpeg"
                                sx={{ width: 150, height: 150 }}
                            />
                        </Badge>
                        <TextField className="item"
                            disabled value={intraName || ''} id="filled-basic" label="Intraname" variant="filled" />
                        <TextField className="item"
                            value={username || ''}
                            helperText="Please enter a username" id="filled-basic" label="Username" variant="filled" required
                            onKeyUp={(e) => keyPress(e)}
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

            <Snackbar open={event !== ""} autoHideDuration={3000} onClose={() => setEvent("")}>
                <Alert onClose={() => setEvent("")} severity="success" sx={{ width: '100%' }}>
                    {event}
                </Alert>
            </Snackbar>

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
