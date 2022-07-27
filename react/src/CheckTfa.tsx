import React from 'react';

interface TfaState {
	li: boolean;
	tfaEnabled: boolean;
}

interface TfaProps {
}
class ShowTfa extends React.Component<TfaProps, TfaState> {
	constructor(props: TfaProps) {
		super(props);
		this.state = {
			li: false,
			tfaEnabled: false,
		}
	}
	async componentDidMount() {
		const li =  fetch("http://127.0.0.1:5000/auth/amiloggedin", { 
			method: 'GET',
			credentials: 'include',
		}).then(response => response.json());
		this.setState({li: await li});
		const tfaEnabled =  fetch("http://127.0.0.1:5000/auth/is_tfa_enabled", { 
			method: 'GET',
			credentials: 'include',
		}).then(response => response.json());
		this.setState({tfaEnabled: await tfaEnabled});
	}
	render() {
		if (!this.state.li)
			return (<div>"You are not logged in, so you can't do 2fa"</div>);
		else if (!this.state.tfaEnabled)
			return (<div>"You are logged in, but you don't have 2fa enabled"</div>);
		else
			{
				return (
					<div>
					<div>
					This is the google authenticator Tfa:
						</div>
					<img src="http://127.0.0.1:5000/2fa/generate" alt="alternatetext"/> 
					</div>
				)
			}
	}
}

const Tfa = () => 
{
	return (
		<main>
		<ShowTfa />
		</main>
	)
}

export default Tfa
