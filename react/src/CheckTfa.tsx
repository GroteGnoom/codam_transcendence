import React from 'react';

interface TfaState {
	li: boolean;
	tfaEnabled: boolean;
	code: string;
	tfaAuthenticated: boolean;
}

interface TfaProps {
}
class ShowTfa extends React.Component<TfaProps, TfaState> {
	constructor(props: TfaProps) {
		super(props);
		this.state = {
			li: false,
			tfaEnabled: false,
			code: "",
			tfaAuthenticated: false,
		}
	}
	handleSubmit = async (event: React.FormEvent<HTMLInputElement>) => {
		//post code /2fa/authenticate
		return await fetch("http://127.0.0.1:5000/2fa/authenticate", {
			method: "POST",
			headers: {'Content-Type':'application/json'},
			body: this.state.code,
		})
		.then(async (response) => {
			if (response.ok) {
				this.setState({tfaAuthenticated: true});
			}
		});
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
					<form>
					<label>Enter your google authenticator code:
						<input type="text" 
					onSubmit={this.handleSubmit}
					value={this.state.code}
					/>
					</label>
					</form>
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
