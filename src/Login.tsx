import React from 'react';
import { useCallback, useState } from 'react'; 

class DoPost extends React.Component {
	async handle() {
		try {
		await fetch("http://127.0.0.1:5000/users/create", { //I (lindsay) added await, not sure if necessary.. 
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
	}
	catch (e) {
		console.log(e)
    }
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

interface OAuthProps {
	authorizeUrl: string;
	clientId: number;
	redirectUri: string;
	scope: string;
}

//https://tasoskakour.com/blog/react-use-oauth2
const OAUTH_STATE_KEY = 'react-use-oauth2-state-key';

// https://medium.com/@dazcyril/generating-cryptographic-random-state-in-javascript-in-the-browser-c538b3daae50
const generateState = () => {
	const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let arr = new Uint8Array(40);
	window.crypto.getRandomValues(arr);
	arr = arr.map((value: number, index: number, arr: Uint8Array) => validChars.codePointAt(value % validChars.length) ?? 0);
	let arr2: number[] = [];
	for (let i = 0; i < 40; i++ ) {
		arr2.push(arr[i]);
	}
	const randomState = String.fromCharCode.apply(null, arr2);
	return randomState;
};

const saveState = (state: string) => {
	sessionStorage.setItem(OAUTH_STATE_KEY, state);
};

const removeState = () => {
	sessionStorage.removeItem(OAUTH_STATE_KEY);
};
const useOAuth2 = (props: OAuthProps) => {
  const {
      authorizeUrl,
      clientId,
      redirectUri,
      scope = '',
    } = props;

  const [{ loading, error }, setUI] = useState({ loading: false, error: null });

  const getAuth = useCallback(
	  (newValue: string): void => setUI({
		  loading: true,
		  error: null,
	  }),
		  [setUI]
	)
}

class DoOAuth extends React.Component {
	handle () {

	}
	render () {
		return (
			<button onClick={this.handle}>
			button!
			</button>
		)
	}
}

const Login = () => 
{
	return (
		<main>
		This page is for login
		This is just for testing and creates a user:
			<DoPost />
		This is for actual authentication:
			<DoOAuth />
		</main>
	)
}

export default Login
