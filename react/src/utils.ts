export function get_backend_host() {
	return ('http://' + window.location.hostname + ":5000");
}

export enum userStatus {
	Online = "online",
	Offline = "offline",
	InGame = "inGame",
}
