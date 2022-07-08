import React from 'react';

class DoPost extends React.Component {
	handle() {
		fetch("http://127.0.0.1:5000/users/create", {
			method: 'POST',
			//mode: 'no-cors',
			headers: {'Content-Type':'application/json'},
			body: JSON.stringify({
				username: "usernieuw",
				password: "passpaaass",
				email: "bla@bla.com",
			})
		})
		.then(response => response.json())
		.then(responseJson => {
			console.log(responseJson);
		});
		console.log('gedaan');
	}
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
