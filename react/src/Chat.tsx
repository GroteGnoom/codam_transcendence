import React, { CSSProperties } from 'react';
import './Chat.css';

class ChannelList extends React.Component<{}, { 
    channels: any[], messages: any[], activeChannel: string 
    text: string, settings: any, newChannel: string }> {

    constructor(props: any){
        super(props);
        this.state = { 
            channels: [], 
            messages: [], 
            activeChannel: "general",
            text: "",
            settings: undefined,
            newChannel: ""
        }
    }

	async getChannels() {
		return await fetch("http://127.0.0.1:5000/channels", { method: 'GET'})
		.then((response) => response.json())
	}

    async postMessage() {
		return await fetch(`http://127.0.0.1:5000/channels/${this.state.activeChannel}/messages`, { 
            method: 'POST',
            headers: {'Content-Type':'application/json'},
			body: JSON.stringify({
                "sender": 7,
                "text": this.state.text
			})
        })
		.then((response) => response.json())
	}

    async demoteAdmin(admin: number) {
		return await fetch(`http://127.0.0.1:5000/channels/${this.state.activeChannel}/admin/${admin}`, { method: 'DELETE'})
		.then((response) => response.json())
	}

    async newchannel() {
		return await fetch("http://127.0.0.1:5000/channels", { 
            method: 'POST',
            headers: {'Content-Type':'application/json'},
			body: JSON.stringify({
                "name": this.state.newChannel,
                "owner": 7
			})
        })
		.then((response) => response.json())
	}

    componentDidMount() {
        this.getChannels()
        .then((response) => {
            this.setState({ channels: response });
        })
    }

    async getMessages(channel: string){
        console.log("this is channel", channel);
        return await fetch(`http://127.0.0.1:5000/channels/${channel}/messages`, { method: 'GET'})
		.then((response) => response.json())
        .then((response) => {
            this.setState({ messages: response });
            this.setState({ activeChannel: channel });
        })
    }

    openSettings(channel: any) {
        this.setState({settings: channel})
    }

	render () { 
        const channels = this.state.channels.map((el) => (
            <div>
                <div onClick={() => this.getMessages(el.name)}>
                {el.name}     
                </div>
                <button onClick={() => this.openSettings(el)}>Settings</button>   
            </div>
        ))

        const messages = this.state.messages.map((el) => (
            <div>
            {new Date(el.date).toDateString()} {new Date(el.date).toLocaleTimeString()} 
            {el.text}            
            </div>
        ))

        var settings = undefined;
        if (this.state.settings) {
            const admins = this.state.settings.admins.map((el: number) => (
                <div>
                    {el}
                    {/* <button>DEMOTE</button> */}
                    <button onClick={() => this.demoteAdmin(el)}>DEMOTE</button> 
                </div>
            ))

            settings = (<div className="Settings">
                Settings for {this.state.settings.name}<br/>
                Owner: {this.state.settings.owner}<br/>
                Admins: {admins}
            </div>)
        }


		return ( 
            <div>
                {channels}
                <form onSubmit={() => this.newchannel()}>
                    <input 
                        type="text" 
                        value={this.state.newChannel}
                        onChange={(e) => this.setState({newChannel: e.target.value})}
                    />
                    <input type="submit" value="add channel" />
                </form>
                {/* <button onClick={() => this.newchannel()}>Add Channel</button>  */}
                <div className="ChatWindow">
                    {this.state.activeChannel}
                    {messages}
                    <form onSubmit={() => this.postMessage()}>
                        <input 
                            type="text" 
                            value={this.state.text}
                            onChange={(e) => this.setState({text: e.target.value})}
                        />
                        <input type="submit" value="Send" />
                    </form>
                </div>
                {settings}
            </div>
		)
	}
}

const Chat = () => {
	return (
		<main>
			<ChannelList />
		</main>
	)
}

export default Chat
