import react from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Icon from '@mui/material/Icon';
import { pink } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const pinkTheme = createTheme({ palette: { primary: pink } })

class Account extends react.Component<{}, {user:[], username: string}> { //set the props to empty object, and set the state to {name: string}
    constructor(props: any) {
        super(props);
        this.state = {
            user: [],
            username: "default"
        }
        this.createUser();
    }

    async createUser() {
        return await fetch("http://127.0.0.1:5000/users", { method: "POST",
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                "username": this.state.username
            })
        })
		.then((response) => response.json())
        .then((response) => {
            this.setState({ user: response });
        })
    }

    async changeUsername () {
        return await fetch("http://127.0.0.1:5000/users/setusername", {
            method: "POST",
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({
                "username": this.state.username
            })
        })
		// this.setState(
        //     { username : "daniel"}
        //     );
	}

    render(){ // holds the HTML code
        console.log(this.state.username);
        // create user object

        return (
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
                    <TextField id="filled-basic" label="Username" variant="filled" onChange={(e) => this.setState({username: e.target.value})} />
                    <Button
                        variant="contained"
                        startIcon={<Icon />}
                        onClick={(e) => this.changeUsername()}
                    />
                </div>
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