import React from 'react';
import {Link} from 'react-router-dom';

class DoPost extends React.Component {
	async getJWT() {
		console.log("ik ga 5000 fetchen");
		const resp =  await fetch("/auth/ft", { 
			method: 'GET',
			//mode: 'no-cors',
		});
		//const body = await resp.json();
		const body = await resp.text();
		console.log(body);
		console.log("ik heb 5000 gefetcht");
		//console.log(resp);
		//const respa = await resp;
		//console.log(respa);
		//.then((response) => response.json())
		return "gedaan";
	}

    // componentDidMount() {
    //     this.handle()
    // }

	render () {
		return (
			<div>
			<form onSubmit={this.getJWT}>
			<label>
			Get JWT:
				<input type="text" name="name" />
			</label>
			<input type="submit" value="Submit" />
			</form>
			</div>
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
