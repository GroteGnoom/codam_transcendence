import React from 'react';

interface QRState {
	li: boolean;
}

interface QRProps {
}
class ShowQR extends React.Component<QRProps, QRState> {
	constructor(props: QRProps) {
		super(props);
		this.state = {
			li: false,
		}
	}
	async componentDidMount() {
		const li =  fetch("http://127.0.0.1:5000/auth/amiloggedin", { 
			method: 'GET',
			credentials: 'include',
		}).then(response => response.json());
		this.setState({li: await li});
	}
	render() {
		if (this.state.li)
			return (
			<div>
			<div>
			This is the google authenticator QR:
				</div>
			<img src="http://127.0.0.1:5000/2fa/generate" alt="alternatetext"/> 
			</div>
			)
		else
			return (<div>"You are not logged in, so I will not show you a QR"</div>);
	}
}

const Login = () => 
{
	return (
		<main>
			<ShowQR />
		</main>
	)
}

export default Login
