const os = require("os");

export function get_frontend_host() {
	const hostName = os.hostname();
	return ('http://' + hostName + ":3000");
}
