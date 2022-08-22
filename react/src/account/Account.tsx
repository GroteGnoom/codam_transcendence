import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import { Alert } from "@mui/material";
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import { pink } from '@mui/material/colors';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormData from 'form-data';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { get_backend_host, userStatus } from '../utils';
import './Account.css';

const pinkTheme = createTheme({ palette: { primary: pink } })

export function Account() {
    const [users, setUsers] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState("");
    const [intraName, setIntraName] = useState("");
    const [error, setError] = useState("");
    const [event, setEvent] = useState("");
    const [avatar, setAvatar] = useState({
        imgSrc: get_backend_host() + "/users/avatar",
        imgHash: Date.now(),
    });
    const [checked, setChecked] = useState(false);
	const url2fa = get_backend_host() + "/2fa/generate";
    const [tfaCode, setTfaCode] = useState("");
    const [userId, setUserId] = useState("");
    const [newTfa, setNewTfa] = useState(false);
    const [severityEvent, setSeverityEvent] = useState("success");
    const navigate = useNavigate();

    getUserId();

    //backend calls
    async function getUserInfoDatabase () {
        fetch(get_backend_host() + "/auth/amiloggedin/", { 
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
        .then(async (response) => {
			console.log('response: ', response);
			if (!response) {
				navigate("/", { replace: true });
			}
		});
        getLoggedIn();
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
            console.log("found isTfaEnabled: " + response.isTfaEnabled);
            setIntraName(response.intraName);
            setUsername(response.username);
            setChecked(response.isTfaEnabled);
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
                console.log('2-factor authentication was OK');
                return true;
            } else {
                throw new Error(json.message);
            }
        }).catch(() => {
            setError("2-factor authentication failed");
            return false;
        });
    }

    async function saveUser () {
        getLoggedIn();
        console.log("try save user...");
        console.log("current users");
        console.log(users);
        if (checked && newTfa) {
            const checkTfa = await checkTfaCode();
            if (checkTfa === false)
                return;
        }
        return await fetch(get_backend_host() + "/users/updateuser", {
            method: "PUT",
            credentials: 'include',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                "username": username,
                "intraName": intraName,
                "status": userStatus.Online,
                "isTfaEnabled": checked,
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
            setSeverityEvent("success");
            setEvent("User saved successfully");
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
            setSeverityEvent("success");
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
            saveUser();
        }
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        getLoggedIn();
        if (!checked) {
            setChecked(true);
            setNewTfa(true);
        }
        else
        setChecked(false);
    };

    async function getUserId() {
        await fetch(get_backend_host() + `/users/user`, { 
            method: 'GET',
            credentials: 'include',
        }).then((response) => response.json())
        .then((response) => {setUserId(response.id)})
    }

    function showAccount() {
        return (
            <div className="menu">
                <Paper className="paper">
                    <Typography sx={{ fontWeight: 700 }} className="item" color="primary" variant="h5" gutterBottom component="div">
                        CHANGE USER SETTINGS
                    </Typography>
                </Paper>
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
                        sx={{ width: 250, height: 250 }}
                    />
                </Badge>
                <TextField className="item"
                    disabled value={intraName || ''} id="filled-basic" label="Intraname" variant="filled" />
                <TextField className="item"
                    value={username || ''}
                    inputProps={{ maxLength: 30 }}
                    helperText="Please enter a username" id="filled-basic" label="Username" variant="filled" required
                    onKeyUp={(e) => keyRelease(e)}
                    onChange={(e) => setUsername(e.target.value)} />
                <FormGroup className="item">
                    <FormControlLabel control={<Switch
                        checked={checked}
                        onChange={handleChange}
                        inputProps={{ 'aria-label': 'controlled' }}
                    />} label="2-factor authentication" />
                </FormGroup>
                {/* show the following only when 2fa is enabled */}
                {checked && newTfa && <p className="item">
                        Google Authenticator QR
                    </p>}
                {checked && newTfa && <img
                    className="item"
                    src={url2fa}
                    alt={""}
                    />}
                {checked && newTfa &&
                    <TextField className="item"
                    inputProps={{ maxLength: 6 }}
                    helperText="Please enter the Google Authenticator code" id="filled-basic" variant="filled" required
                    onChange={(e) => setTfaCode(e.target.value)}/>}
                <Button className="item"
                    variant="contained"
                    // startIcon={<PersonOutlineSharpIcon />}
                    onClick={() => saveUser()}
                    > Save changes </Button>
                <Link className={"App-link"} to={{ pathname: "/userinfo/" + userId }}><Button className="item" variant="contained">My profile</Button></Link>
            </div>
        )
    }

    // const sleep = (milliseconds : any) => {
    //     return new Promise(resolve => setTimeout(resolve, milliseconds))
    // }

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn]); // will only be called when isLoggedIn changes

    useEffect(() => {
        getUserInfoDatabase();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // will only be called on initial mount and unmount

    return ( // holds the HTML code
        <ThemeProvider theme={pinkTheme}>
            <div>
                { showAccount() }
            </div>

            <Snackbar open={event !== ""} autoHideDuration={3000} onClose={() => setEvent("")}>
                <Alert onClose={() => setEvent("")} severity={severityEvent === "error" ? "error" : "success"} sx={{ width: '100%' }}>
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
                    <Button variant="contained" onClick={() => setError("")}>OK</Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    )
}
