import React from 'react';
import { get_backend_host } from './utils';

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
		const li =  fetch(get_backend_host() + "/auth/amiloggedin", { 
			method: 'GET',
			credentials: 'include',
		}).then(response => response.json());
		this.setState({li: await li});
	}
	render() {
		const url = get_backend_host() + "/2fa/generate"
		if (this.state.li)
			return (
			<div>
			<div>
			This is the google authenticator QR:
				</div>
			<img src={url} alt="alternatetext"/> 
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
