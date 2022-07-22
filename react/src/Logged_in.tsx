import React from 'react';
import {
  useParams
} from "react-router-dom";


const Logged_in = () => 
{  
	let { token } = useParams();
	localStorage.setItem('token', token!);
	return (
		<main>
		This page is for login. This is the token I received: 
			{token}
		</main>
	)
	}

export default Logged_in
