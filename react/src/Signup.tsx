import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import PersonOutlineSharpIcon from '@mui/icons-material/PersonOutlineSharp';
import { Alert } from "@mui/material";
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import { pink } from '@mui/material/colors';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Snackbar from '@mui/material/Snackbar';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import FormData from 'form-data';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';
import { get_backend_host, userStatus } from './utils';

const pinkTheme = createTheme({ palette: { primary: pink } })

export function Signup() {
    const [users, setUsers] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSignedUp, setIsSignedUp] = useState(false);
    const [username, setUsername] = useState("");
    const [intraName, setIntraName] = useState("");
    const [status, setStatus] = useState(userStatus.Online);
    const [error, setError] = useState("");
    const [event, setEvent] = useState("");
    const [avatar, setAvatar] = useState({
        imgSrc: get_backend_host() + "/users/avatar",
        imgHash: Date.now(),
    });
    const [checked, setChecked] = useState(false);
    const url = get_backend_host() + "/auth/ft";
	const url2fa = get_backend_host() + "/2fa/generate";
    const [tfaCode, setTfaCode] = useState("");
    const [started, setStarted] = useState(false);
    const navigate = useNavigate();

    //backend calls
    async function getUserInfoDatabase () {
        getLoggedIn();
        if (isLoggedIn === false)
            return;
        return await fetch(get_backend_host() + "/users/user", {
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
            setIsSignedUp(response.isSignedUp);
        })
        .catch((err: Error) => setError(err.message))
    }

    async function getLoggedIn () {
        return await fetch(get_backend_host() + "/auth/amiloggedin/", { 
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
        return await fetch(get_backend_host() + "/users", {
            method: "GET"} )
        .then(async (response) => {
            const json = await response.json();
            if (response.ok) {
                return json;
            } else {
                throw new Error(json.message)
            }
        })
        .then((response) => {
            setUsers(response);
        })
        .catch((err: Error) => setError(err.message))
    }

    async function checkTfaCode () {
        const data = new URLSearchParams();
        data.append("twoFactorAuthenticationCode", tfaCode);
        console.log('going to post ', tfaCode);
        return await fetch(get_backend_host() + "/2fa/authenticate", {
            method: "POST",
            credentials: 'include',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: data,
            mode: 'cors',
        })
        .then(async (response) => {
            const json = await response.json();
            if (response.ok) {
                console.log('response was OK');
                setEvent("2-factor authentication successful"); // TODO: not needed??
                return true;
            } else {
                throw new Error(json.message);
            }
        }).catch((error) => {
            console.log("catched the error");
            return false;
        });
    }

    async function signUpUser () {
        getLoggedIn();
        console.log("try save user...");
        console.log("current users");
        console.log(users);
        if (checked) {
            const checkTfa = await checkTfaCode();
            if (checkTfa === false){
                setError("2-factor authentication failed");
                return;
            }
        }
        return await fetch(get_backend_host() + "/users/signupuser", {
            method: "PUT",
            credentials: 'include',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                "username": username,
                "intraName": intraName,
                "status": status,
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
            getUsers();
            setIsSignedUp(true);
            setEvent("User created successfully");
        })
        .catch((err: Error) => setError(err.message))
    }

    async function saveAvatar(e: any){
        getLoggedIn();
        console.log(e.target.files[0]);
        console.log(e.target.files[0].name);
        console.log(e.target.files[0].size);
        console.log(e.target.files[0].type);
    
        const file = e.target.files[0];
        const form = new FormData();
        form.append('file', file, file.name);
        console.log(form);
        console.log(typeof form);

        return await fetch(get_backend_host() + "/users/avatar", {
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
        .then(() => {
            setEvent("Avatar created successfully");
            setAvatar({
                imgSrc: get_backend_host() + "/users/avatar",
                imgHash: Date.now() // this will change the src attribute of avatar loading
            });
        })
        .catch((err: Error) => setError(err.message))
    }

    function keyRelease(e: any) {
        if (e.key === 'Enter'){
            signUpUser();
        }
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        getLoggedIn();
        setChecked(event.target.checked);
    };

    function showSignup() {
        return (
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
                                        onChange={(e) => saveAvatar(e)}                                              
                                    />
                                    <ChangeCircleIcon
                                        fontSize='large'
                                        onClick={() => getLoggedIn()}
                                    />
                                </Button>
                        </Avatar>
                    }
                    >
                    <Avatar className="item"
                        alt={intraName} // first letter of alt (alternative) text is default avatar if loading src fails
                        src={`${avatar.imgSrc}?${avatar.imgHash}`}
                        sx={{ width: 200, height: 200 }}
                    />
                </Badge>
                <TextField className="item"
                    disabled value={intraName || ''} id="filled-basic" label="Intraname" variant="filled" />
                <TextField className="item"
                    value={username || ''}
                    helperText="Please enter a username" id="filled-basic" label="Username" variant="filled" required
                    onKeyUp={(e) => keyRelease(e)}
                    onChange={(e) => setUsername(e.target.value)} />
                <FormGroup className="item">
                    <FormControlLabel control={<Checkbox
                        checked={checked}
                        onChange={handleChange}
                        inputProps={{ 'aria-label': 'controlled' }}
                    />} label="Enable 2-factor authentication" />
                </FormGroup>
                {/* show the following only when 2fa is enabled */}
                {checked && <p className="item">
                        Google Authenticator QR
                    </p>}
                {checked && <img
                    className="item"
                    src={url2fa}
                    alt={""}
                    />}
                {checked && 
                    <TextField className="item"
                    helperText="Please enter the Google Authenticator code" id="filled-basic" variant="filled" required
                    onChange={(e) => setTfaCode(e.target.value)}/>}
                    {/* TODO: max_length text field */}
                <Button className="item"
                    variant="contained"
                    startIcon={<PersonOutlineSharpIcon />}
                    onClick={() => signUpUser()}
                > SIGN UP </Button>
            </div>
        )
    }

    const sleep = (milliseconds : any) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
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
        console.log("isSignedUp changed to: ", isSignedUp);
        if ( isLoggedIn && isSignedUp ) {
            navigate('/');
        }
    }, [isSignedUp]); // will only be called when isSignedUp changes

    useEffect(() => {
        async function fetchData() { // sleep before fetching the data to show spinner
            await sleep(500);
            setStarted(true);
            getUserInfoDatabase();
        }
        fetchData();
    }, []); // will only be called on initial mount and unmount


    return ( // holds the HTML code
        <ThemeProvider theme={pinkTheme}>
            { started === false ? // before fetchin the data, show spinner
                ( <div className="menu"> <CircularProgress/> </div> )
            : isLoggedIn ? ( // only show this when logged in
                <div>
                    {!isSignedUp && showSignup()}
                    {/* <Button variant="contained" onClick={() => redir()}>please go backkkk</Button> */}
                </div>
            ) : ( // if not logged in, show login button
                <div className="menu">
                    {/* TODO get backend server */}
                    <a className="App-link" href={url}><Button className="button" variant="contained">Log in 42</Button></a> 
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
