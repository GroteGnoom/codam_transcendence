import React from 'react';
import { get_backend_host } from './utils';

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
		this.handleChange = this.handleChange.bind(this);
	}
	handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		const data = new URLSearchParams();
		data.append("twoFactorAuthenticationCode", this.state.code);
		console.log('going to post ', this.state.code);
		event.preventDefault();
		return await fetch(get_backend_host() + "/2fa/authenticate", {
			method: "POST",
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			body: data,
			mode: 'cors',
		})
		.then((response) => {
			if (response.ok) {
				console.log('response was OK');
				this.setState({tfaAuthenticated: true});
			} else {
				console.log('response not OK :(');
				console.log(response);
			}
		}).catch((error) => {
			console.error("there's an error:", error);
		});
	}
	async componentDidMount() {
		const li =  fetch(get_backend_host() + "/auth/amiloggedin", { 
						  method: 'GET',
						  credentials: 'include',
				}).then(response => response.json());
	this.setState({li: await li});
	const tfaEnabled =  fetch(get_backend_host() + "/auth/is_tfa_enabled", { 
			method: 'GET',
			credentials: 'include',
		}).then(response => response.json());
		this.setState({tfaEnabled: await tfaEnabled});
	}
	handleChange(event: any) {
		console.log("handleChange");
		this.setState({code: event.target.value});
	}
	render() {
		if (this.state.tfaAuthenticated) {
			console.log("authenitcated!");
			return (<div>"You have been authenticated"</div>);
		} else if (!this.state.li)
			return (<div>"You are not logged in, so you can't do 2fa"</div>);
		else if (!this.state.tfaEnabled)
			return (<div>"You are logged in, but you don't have 2fa enabled"</div>);
		else
			{
				return (
					<div>
					<form onSubmit={this.handleSubmit}>
					<label>
					Enter your google authenticator code:
						<textarea value={this.state.code} onChange={this.handleChange} maxLength={6}/>
					</label>
					<input type="submit" value="Submit" />
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
