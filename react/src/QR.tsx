import React from 'react';

class ShowQR extends React.Component {
	render () {
		return (
			<div>
			<img src="http://127.0.0.1:5000/2fa/generate" alt="alternatetext"/> 
			</div>
		)
	}
}

const Login = () => 
{
	return (
		<main>
		This is the google authenticator QR:
			<ShowQR />
		</main>
	)
}

export default Login
