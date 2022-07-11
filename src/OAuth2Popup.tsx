import { useEffect } from 'react';
//import { queryToObject } from './tools';

const OAUTH_STATE_KEY = 'react-use-oauth2-state-key';
const OAUTH_RESPONSE = 'react-use-oauth2-response';

const checkState = (receivedState: string) => {
	const state = sessionStorage.getItem(OAUTH_STATE_KEY);
	return state === receivedState;
};

const queryToObject = (query: string) => {
	const parameters = new URLSearchParams(query);
	return Object.fromEntries(parameters.entries());
};

interface OAuthPopupProps {
	Component: Element;
}

const OAuthPopup = () => {
	// On mount
	useEffect(() => {
		const payload = queryToObject(window.location.search.split('?')[1]);
		const state = payload && payload.state;
		const error = payload && payload.error;

		if (!window.opener) {
			throw new Error('No window opener');
		}

		if (error) {
			window.opener.postMessage({
				type: OAUTH_RESPONSE,
				error: decodeURI(error) || 'OAuth error: An error has occured.',
			});
		} else if (state && checkState(state)) {
			window.opener.postMessage({
				type: OAUTH_RESPONSE,
				payload,
			});
		} else {
			window.opener.postMessage({
				type: OAUTH_RESPONSE,
				error: 'OAuth error: State mismatch.',
			});
		}
	}, []);

	return (
			<div style={{ margin: '12px' }} data-testid="popup-loading">
				Loading...
			</div>
		)

};

export default OAuthPopup;
