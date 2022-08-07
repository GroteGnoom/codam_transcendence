import BlockIcon from '@mui/icons-material/Block';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import { Box, Button, Divider, IconButton, List, ListItem, ListItemText, Stack, Typography } from "@mui/material";
import React from "react";
import { useParams } from "react-router-dom";
import { get_backend_host } from "../utils";


//https://ui.dev/react-router-url-parameters
//https://stackoverflow.com/questions/58548767/react-router-dom-useparams-inside-class-component
function withParams(Component: any) {
  return (props: any) => <Component {...props} params={useParams()} />;
}

interface UserInfoProps { 
    params: any;
    statusWebsocket: any;
}

interface UserInfoState { 
    user: any;
    isBlocked: Boolean;
    isFriend: Boolean;
}

class UserInfo extends React.Component<UserInfoProps, UserInfoState> {
    constructor(props: UserInfoProps){
        super(props);
        this.state = { 
            user: undefined,
            isBlocked: false,
            isFriend: false,
        }
    }

    getUserInfo() {
        fetch(get_backend_host() + `/users/id/${this.props.params.id}`, { 
            method: 'GET',
            credentials: 'include',
        })
		.then((response) => response.json())
        .then((response) => {
            this.setState({ user: response });            
        })
    }

    blockUser() {
        fetch(get_backend_host() + `/users/block/${this.props.params.id}`, { 
            method: 'PUT',
            credentials: 'include',
        })
        .then ( () =>
            this.setState({ isBlocked: true })
        )
    }

    unblockUser() {
        fetch(get_backend_host() + `/users/unblock/${this.props.params.id}`, { 
            method: 'PUT',
            credentials: 'include',
        })
        .then ( () =>
            this.setState({ isBlocked: false })
        )
    }

    isUserBlocked() {
        fetch(get_backend_host() + `/users/is-blocked/${this.props.params.id}`, { 
            method: 'GET',
            credentials: 'include',
        })
        .then((response) => response.json())    //parses to boolean
        .then((response) => {
            this.setState({ isBlocked: response });            
        })
    }

    friendUser() {
        fetch(get_backend_host() + `/users/friend/${this.props.params.id}`, { 
            method: 'PUT',
            credentials: 'include',
        })
        .then ( () =>
            this.setState({ isFriend: true })
        )
    }

    unfriendUser() {
        fetch(get_backend_host() + `/users/unfriend/${this.props.params.id}`, { 
            method: 'PUT',
            credentials: 'include',
        })
        .then ( () =>
            this.setState({ isFriend: false })
        )
    }

    isUserFriend() {
        fetch(get_backend_host() + `/users/is-friend/${this.props.params.id}`, { 
            method: 'GET',
            credentials: 'include',
        })
        .then((response) => response.json())    //parses to boolean
        .then((response) => {
            this.setState({ isFriend: response });            
        })
    }

    updateStatus(socketMessage: any){   //subscribed to statusUpdate events through ws
        const user = this.state.user;
        const friends = user.friends.map((el: any) => {
            if (socketMessage.userID === Number(el.id)){
                console.log("Friends status was updated");
                el.status = socketMessage.status;
                this.setState( { user : user } );
            }
        })     
    }

    componentDidMount() {
        this.getUserInfo()
        this.isUserBlocked()
        this.isUserFriend()

        if (this.props.statusWebsocket){
            console.log("subscribe to status ws", this.props.statusWebsocket)
            this.props.statusWebsocket.on("statusUpdate", (payload: any) => {this.updateStatus(payload)} )
        }
    }

    renderFriends = () => {
        const friends = this.state.user.friends.map((el: any) => (
                <ListItem key={el.id}>
                    { el.status==="offline" &&
                        <IconButton
                        color="error" >
                            <BlurOnIcon fontSize='small'/>
                        </IconButton>
                    }
                    { el.status==="online" &&
                        <IconButton
                        color="success" >
                            <BlurOnIcon fontSize='small'/>
                        </IconButton>
                    }
                    { el.status==="inGame" &&
                        <IconButton
                        color="secondary" >
                            <SportsTennisIcon fontSize='small'/>
                        </IconButton>
                    }

                    <ListItemText 
                        primary={`${el.username}`}
                    />            
                </ListItem>
            ))  
            return (
                <List sx={{width: '100%', maxWidth: 250, bgcolor: '#f48fb1' }}>
                    {friends}
                </List>
            );
        }

    render(){ 
        return (
            <div className="menu">
                <Stack direction="row">
                    { this.state.user &&
                        <Typography variant='h2' sx={ {m:3} } >
                            {this.state.user.username}
                        </Typography>
                    }
                    { this.state.isFriend && 
                            <IconButton type="submit" onClick={() => (this.unfriendUser())}
                                color="secondary">
                                <FavoriteIcon fontSize='large'/>
                            </IconButton>
                    }
                    { !this.state.isFriend && 
                            <IconButton type="submit" onClick={() => (this.friendUser())}
                                color="secondary">
                                <FavoriteBorderIcon fontSize='large'/>
                            </IconButton>
                    }
                    { !this.state.isBlocked && 
                        <IconButton type="submit" onClick={() => this.blockUser()}
                            color="secondary">
                            <BlockIcon fontSize='large'/>
                        </IconButton>
                    }
                    { this.state.isBlocked && 
                        <Button variant="text" onClick={() => this.unblockUser()}>
                            UNBLOCK
                        </Button> 
                    }
                </Stack>
                <Stack direction="row">
                    <Box sx={{ width: '100%', maxWidth: 250, bgcolor: '#f06292', m:10, mr: 16}}>
                        <Typography sx={{ flex: 1 }} variant="h6" component="div">
                            Friends
                        </Typography>
                        <Divider />
                        {this.state.user && this.renderFriends()}
                    </Box>
                    <Box sx={{ width: '100%', maxWidth: 300, bgcolor: '#f06292', m:10, ml:16 }}>
                        <Typography sx={{ flex: 1 }} variant="h6" component="div">
                            Matches
                        </Typography>
                        <Divider />
                        {this.state.user && this.renderFriends()}
                    </Box>
                </Stack>


            </div>
        )
    }
}

export default withParams(UserInfo)