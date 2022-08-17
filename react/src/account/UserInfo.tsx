import BlockIcon from '@mui/icons-material/Block';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import StarIcon from '@mui/icons-material/Star';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import { Avatar, Box, Button, Divider, IconButton, ListItem, ListItemText, Stack, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from "@mui/material";
import React from "react";
import { Link, useParams } from "react-router-dom";
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { get_backend_host } from "../utils";
import { useNavigate } from 'react-router-dom';

//https://ui.dev/react-router-url-parameters
//https://stackoverflow.com/questions/58548767/react-router-dom-useparams-inside-class-component
// function withParams(Component: any) {
//   return (props: any) => <Component {...props} params={useParams()} />;
// }

interface UserInfoProps { 
    params: any;
    statusWebsocket: any;
    navigation: any;
}

interface UserInfoState { 
    currentUser: any;  //loggedin user
    user: any;
    isBlocked: Boolean;
    isFriend: Boolean;
    matches: any[];   //array of match entities
    ranking?: number;
}

class UserInfo extends React.Component<UserInfoProps, UserInfoState> {
    constructor(props: UserInfoProps){
        super(props);
        this.state = { 
            currentUser: undefined,
            user: undefined,
            isBlocked: false,
            isFriend: false,
            matches: [],
            ranking: undefined,
        }
    }

    avatar: any;

    async getCurrentUser() {
        return await fetch(get_backend_host() + "/users/user", { 
            method: 'GET',
            credentials: 'include',
        })
		.then((response) => response.json())
        .then((response) => {
            this.setState({ currentUser: response });
        })
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

    getRanking() {
        fetch(get_backend_host() + `/match/ranking/${this.props.params.id}`, { 
            method: 'GET',
            credentials: 'include',
        })
		.then((response) => response.json())
        .then((response) => {
            this.setState({ ranking: response });            
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

    getMatches(){
        fetch(get_backend_host() + `/match/history/${this.props.params.id}`, { 
            method: 'GET',
            credentials: 'include',
        })
        .then((response) => response.json())
        .then((response) => {
            this.setState({ matches: response });            
        })
    }

    updateStatus(socketMessage: any){   //subscribed to statusUpdate events through ws
        console.log(socketMessage)
        const user = this.state.user;
        if (! user)
            return;
        user.friends.forEach((el: any) => {
            if (socketMessage.userID === Number(el.id)){
                console.log("Friends status was updated");
                el.status = socketMessage.status;
                this.setState( { user : user } );
            }
        })     
    }

    updateInGameStatus(socketMessage: any){   //subscribed to statusInGameUpdate events through ws
        const user = this.state.user;
        console.log("update Game Status: ")
        console.log(socketMessage)
        user.friends.forEach((el: any) => {
            if (socketMessage.userID === Number(el.id)){
                el.inGame = socketMessage.inGame;
                this.setState( { user : user } );
            }
        })     
    }

    componentDidUpdate(prevProps: UserInfoProps, prevState: UserInfoState) { 
        if (
            !prevProps.params || !this.props.params ||
            prevProps.params.id !== this.props.params.id) {
                this.componentDidMount()
        }
    }

    componentDidMount() {
        this.redirHome()
        
        if (this.props.statusWebsocket){
            console.log("subscribe to status ws", this.props.statusWebsocket)
            this.props.statusWebsocket.on("statusUpdate", (payload: any) => {this.updateStatus(payload)} )
            this.props.statusWebsocket.on("inGameStatusUpdate", (payload: any) => {this.updateInGameStatus(payload)} )
        }
        else{
            console.log("no websocket :(")
        }
         // TODO test if first subscribing to the socket and then getting friends helps concurrency issues 
        
        this.getUserInfo()
        this.getCurrentUser()
        this.isUserBlocked()
        this.isUserFriend()
        this.getMatches()
        this.getRanking()
    }

    componentWillUnmount() {
        this.props.statusWebsocket.off("statusUpdate")    // unsubscribe for events
        this.props.statusWebsocket.off("inGameStatusUpdate")
    }

    renderMatches = () => {
        const matches = this.state.matches.map((el: any) => (
            <TableRow
            key={el.id}
            sx={{ '&:last-child td, &:last-child th': { border: 0 }, bgcolor: '#f48fb1' }} >
                <TableCell align="right" style={{ width: 150 }}>
                    <Link to={{ pathname:`/userinfo/${el.player_1.id}`} } style={{ color: '#e91e63' }}>
                                {`${el.player_1.username}`}
                    </Link>
                </TableCell>
                <TableCell align="right" >{`${el.scoreP1}`}</TableCell>
                <TableCell align="center">{"-"}</TableCell>
                <TableCell align="right">{`${el.scoreP2}`}</TableCell>
                <TableCell align="left" style={{ width: 150 }}>
                    <Link to={{ pathname:`/userinfo/${el.player_2.id}`} } style={{ color: '#e91e63' }}>
                                {`${el.player_2.username}`}
                    </Link>
                </TableCell>
            </TableRow>
            ))
        return (
            <Box sx={{ width: '100%', height: 400, maxWidth: 500, bgcolor: '#f06292', m:10, ml:16 }}>
                <Typography variant="h6" component="div">
                    Matches
                </Typography>
                <Divider />
                <TableContainer style={{ maxHeight: 360 }}  sx={{bgcolor: '#f48fb1'}}>
                    <Table stickyHeader sx={{bgcolor: '#f48fb1'}}>
                        <TableBody>
                            {matches}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        );
    }

    renderFriendsRow(props: ListChildComponentProps) {
        const { index, style } = props;
        const el = this.state.user.friends[index];
    
        return (
            <ListItem key={index} style={style} sx={{bgcolor: '#f48fb1'}} >
                { (el.status==="offline" && !(this.state.currentUser && el.id === this.state.currentUser.id)) &&
                    <IconButton
                    color="error" >
                        <BlurOnIcon fontSize='small'/>
                    </IconButton>
                }
                { ((el.status==="online" && !el.inGame) || (this.state.currentUser && el.id === this.state.currentUser.id)) &&
                    <IconButton
                    color="success" >
                        <BlurOnIcon fontSize='small'/>
                    </IconButton>
                }
                { el.inGame && el.status==="online" &&
                    <IconButton
                    color="secondary" >
                        <SportsTennisIcon fontSize='small'/>
                    </IconButton>
                }

                <ListItemText >
                    <Typography variant="body1">
                        <Link to={{ pathname:`/userinfo/${el.id}`} } style={{ color: '#e91e63' }}>
                            {`${el.username}`}
                        </Link>
                    </Typography>
                </ListItemText>         
            </ListItem> 
        )
    }

    renderFriends = () => {
        return (
            <Box
                sx={{ width: '100%', height: 400, maxWidth: 360, bgcolor: '#f06292', m:10, ml:16 }}>
                <Typography variant="h6" component="div">
                    Friends
                </Typography>
                <Divider />
                <FixedSizeList
                    height={360}
                    width={360}
                    itemSize={46}
                    itemCount={this.state.user ? this.state.user.friends.length : 0}
                    overscanCount={5}                    
                >
                {(props) => this.renderFriendsRow(props)}
                </FixedSizeList>
            </Box>
        );
    }

    async redirHome() {
        const { navigation } = this.props;
        const li =  fetch(get_backend_host() + "/auth/amiloggedin", { 
            method: 'GET',
            credentials: 'include',
        }).then(response => response.json());
        console.log(await li);
        if (await li === false) {
            console.log("navigate");
            navigation("/", { replace: true });
            return;
        }
        this.avatar = {
            imgSrc: get_backend_host() + `/users/avatar/${this.props.params.id}`,
            imgHash: Date.now(), 
        }
    }

    render(){
        this.redirHome();
        if (!this.avatar)
            return;

        return (
            <div className="menu">
                <Stack direction="row">
                { this.state.user &&
                        <Avatar
                            alt={this.state.user.intraName} // first letter of alt (alternative) text is default avatar if loading src fails
                            src={`${this.avatar.imgSrc}?${this.avatar.imgHash}`}
                            sx={{ height: 120, width: 120, mt:3}}
                        />
                    }
                    { this.state.user &&
                        <Typography variant='h2' sx={ {m:3, ml:5, mt:5} } style={{ color: '#f06292' }}>
                            {this.state.user.username}
                        </Typography>
                    }
                    { this.state.isFriend && 
                        <IconButton type="submit" onClick={() => (this.unfriendUser())}
                            color="primary">
                            <FavoriteIcon fontSize='large' />
                        </IconButton>
                    }
                    { !this.state.isFriend && 
                        <IconButton type="submit" onClick={() => (this.friendUser())}
                            color="primary">
                            <FavoriteBorderIcon fontSize='large' style={{ color: '#f06292' }}/>
                        </IconButton>
                    }
                    { !this.state.isBlocked && 
                        <IconButton type="submit" onClick={() => this.blockUser()}
                            color="primary">
                            <BlockIcon fontSize='large' style={{ color: '#f06292' }}/>
                        </IconButton>
                    }
                    { this.state.isBlocked && 
                        <Button variant="text" style={{ color: '#f06292' }} onClick={() => this.unblockUser()}>
                            UNBLOCK
                        </Button> 
                    }
                    { this.state.user && 
                        <Box sx={{bgcolor: '#f06292', ml:10 }}>
                            <Typography variant="h6" component="div">
                                Stats
                            </Typography>
                            <Divider />         
                            <Table sx={{bgcolor: '#f48fb1'}} size='small'>
                                <TableBody>
                                    <TableRow sx={{height:40}}>
                                        <TableCell align="left" >Wins</TableCell>
                                        <TableCell  align="right">{this.state.user.gameStats 
                                                    && this.state.user.gameStats.wins}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow sx={{height:40}}>
                                        <TableCell align="left" >Losses</TableCell>
                                        <TableCell  align="right">{(this.state.user.gameStats 
                                                    && this.state.user.gameStats.losses)}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow sx={{height:40}}>
                                        <TableCell align="left" >
                                        <Link to={{ pathname:`/leaderboard`} } style={{ color: '#e91e63' }}>
                                            Ranking
                                        </Link>                                        
                                        </TableCell>
                                        <TableCell align="right">
                                            {this.state.ranking}                                        
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Box>
                    }
                    { this.state.user && 
                        <Box sx={{bgcolor: '#f06292', ml:10 }}>
                            <Typography variant="h6" component="div">
                                Achievements
                            </Typography>
                            <Divider />         
                            <Table sx={{bgcolor: '#f48fb1'}} size='small'>
                                <TableBody>
                                    <TableRow sx={{height:40}}>
                                        <TableCell align="left" >Play a Game of PinkPong</TableCell>
                                        <TableCell  align="right">
                                                    {   ( this.state.user.gameStats.wins > 0 
                                                        || this.state.user.gameStats.losses > 0) ?
                                                        <StarIcon fontSize='small'  style={{ color: 'fuchsia' }}/> :
                                                        <StarOutlineIcon fontSize='small' style={{ color: 'LightPink' }}/>
                                                    }
                                        </TableCell>
                                    </TableRow>
                                    <TableRow sx={{height:40}}>
                                        <TableCell align="left" >Win 3 Matches</TableCell>
                                        <TableCell  align="right">                                                    
                                                    {   this.state.user.gameStats.wins >= 3 ?
                                                        <StarIcon fontSize='small' style={{ color: 'fuchsia' }}/> :
                                                        <StarOutlineIcon fontSize='small' style={{ color: 'LightPink' }}/>
                                                    }
                                        </TableCell>
                                    </TableRow>
                                    <TableRow sx={{height:40}}>
                                        <TableCell align="left" >First Place on Leaderboard</TableCell>
                                        <TableCell  align="right">
                                                    {   (this.state.user.gameStats.beenNumberOne) ?
                                                        <StarIcon fontSize='small' style={{ color: 'fuchsia' }}/> :
                                                        <StarOutlineIcon fontSize='small' style={{ color: 'LightPink' }}/>
                                                    }
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Box>
                    }
                </Stack>
                <Stack direction="row">
                    {this.renderFriends()}
                    {this.renderMatches()}
                </Stack>
            </div>
        )
    }
}

export default function UserInfoFunction(props: any) {
    const navigation = useNavigate();
    
    return <UserInfo {...props} navigation={navigation} params={useParams()}/>;
}
