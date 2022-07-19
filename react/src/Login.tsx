import React from 'react';
import {Link} from 'react-router-dom';


class DoPost extends React.Component<{}, { username: string  }>  {
    constructor(props: any){
        super(props);
        this.state = { 
			username: ""
        }	
    }
	
	async handle() {
		await fetch("http://127.0.0.1:5000/users/create", {
			method: 'POST',
			//redirect: 'follow',
			//mode: 'no-cors',
			headers: {'Content-Type':'application/json'},
			body: JSON.stringify({
				username: this.state.username,
				password: "passpaaass",
				email: "bla@bla.com",
			})
		})
		// .then(response => response.json())
		.then(responseJson => {
			console.log(responseJson);
		});
		console.log('gedaan');
	}

    // componentDidMount() {
    //     this.handle()
    // }

	render () {
		return (
			<form onSubmit={this.handle}>
			<label>
			Name:
				<input type="text" name="name" />
			</label>
			<input type="submit" value="Submit" />
			</form>
		)
	}
}

const Login = () => 
{
	return (
		<main>
		This page is for login
			<DoPost />
		</main>
	)
}

export default Login
