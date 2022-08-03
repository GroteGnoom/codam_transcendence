const { exec } = require('child_process');

export function get_frontend_host() {
	//const hostName = os.hostname();
	
	var hostName: string = '127.0.0.1';
	/*
	exec('hostname', (error, stdout, stderr) => {
		console.log('error: ', error);
		console.log('stderr: ', stderr);
		console.log('stdout: ', stdout);
		hostName = stdout.toString();
	});
   */
	return ('http://' + hostName + ":3000");
}
