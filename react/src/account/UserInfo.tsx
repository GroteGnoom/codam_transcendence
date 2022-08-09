import BlockIcon from '@mui/icons-material/Block';
import BlurOnIcon from '@mui/icons-material/BlurOn';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import { Box, Button, Divider, IconButton, List, ListItem, ListItemText, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import React from "react";
import { Link, useParams } from "react-router-dom";
import { FixedSizeList, ListChildComponentProps } from 'react-window';
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
            ranking: undefined
        }
    }

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
        const user = this.state.user;
        user.friends.forEach((el: any) => {
            if (socketMessage.userID === Number(el.id)){
                console.log("Friends status was updated");
                el.status = socketMessage.status;
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
        this.getUserInfo()
        this.getCurrentUser()
        this.isUserBlocked()
        this.isUserFriend()
        this.getMatches()
        this.getRanking()

        if (this.props.statusWebsocket){
            console.log("subscribe to status ws", this.props.statusWebsocket)
            this.props.statusWebsocket.on("statusUpdate", (payload: any) => {this.updateStatus(payload)} )
        }
    }

    // renderMatchesRow(props: ListChildComponentProps) {
    //     const { index, style } = props;
    //     const el = this.state.matches[index];
   
    //     return (
    //         <TableRow
    //         key={index}
    //         sx={{ '&:last-child td, &:last-child th': { border: 0 }, bgcolor: '#f48fb1' }} >
    //             <TableCell align="right" style={{ width: 300 }}>
    //                 <Link to={{ pathname:`/userinfo/${el.player_1.id}`} }>
    //                             {`${el.player_1.username}`}
    //                 </Link>
    //             </TableCell>
    //             <TableCell align="right" >{`${el.scoreP1}`}</TableCell>
    //             <TableCell align="center">{"-"}</TableCell>
    //             <TableCell align="right">{`${el.scoreP2}`}</TableCell>
    //             <TableCell align="left" style={{ width: 300 }}>
    //                 <Link to={{ pathname:`/userinfo/${el.player_2.id}`} }>
    //                             {`${el.player_2.username}`}
    //                 </Link>
    //             </TableCell>
    //         </TableRow>
    //     );
    // }

    // renderMatches2 = () => {
    //     return (
    //         <Box
    //           sx={{ width: '100%', height: 400, maxWidth: 360, bgcolor: '#f06292', m:10, ml:16 }}>
    //             <Typography variant="h6" component="div">
    //                 Matches
    //             </Typography>
    //             <Divider />
    //             <FixedSizeList
    //                 height={400}
    //                 width={360}
    //                 itemSize={46}
    //                 itemCount={this.state.matches.length}
    //                 overscanCount={5}                    
    //             >
    //             {(props) => this.renderMatchesRow(props)}
    //           </FixedSizeList>
    //         </Box>
    //       );
    // }



    renderMatches = () => {
        const matches = this.state.matches.map((el: any) => (
            <TableRow
                key={el.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
                <TableCell align="right" style={{ width: 300 }}>
                    <Link to={{ pathname:`/userinfo/${el.player_1.id}`} }>
                                {`${el.player_1.username}`}
                    </Link>
                </TableCell>
                <TableCell align="right" >{`${el.scoreP1}`}</TableCell>
                <TableCell align="center">{"-"}</TableCell>
                <TableCell align="right">{`${el.scoreP2}`}</TableCell>
                <TableCell align="left" style={{ width: 300 }}>
                    <Link to={{ pathname:`/userinfo/${el.player_2.id}`} }>
                                {`${el.player_2.username}`}
                    </Link>
                </TableCell>
            </TableRow>
            ))
            return (
                <Table sx={{bgcolor: '#f48fb1'}}>
                    <TableBody>
                        {matches}
                    </TableBody>
                </Table>
            );
        }


    // renderFriendsRow(props: ListChildComponentProps) {
    //     const { index, style } = props;
    //     const el = this.state.user.friends[index];
    
    //     return (
    //         <ListItem key={index}>
    //             { (el.status==="offline" && !(this.state.currentUser && el.id === this.state.currentUser.id)) &&
    //                 <IconButton
    //                 color="error" >
    //                     <BlurOnIcon fontSize='small'/>
    //                 </IconButton>
    //             }
    //             { (el.status==="online" || (this.state.currentUser && el.id === this.state.currentUser.id)) &&
    //                 <IconButton
    //                 color="success" >
    //                     <BlurOnIcon fontSize='small'/>
    //                 </IconButton>
    //             }
    //             { el.status==="inGame" &&
    //                 <IconButton
    //                 color="secondary" >
    //                     <SportsTennisIcon fontSize='small'/>
    //                 </IconButton>
    //             }

    //             <ListItemText >
    //                 <Typography variant="body1">
    //                     <Link to={{ pathname:`/userinfo/${el.id}`} }>
    //                         {`${el.username}`}
    //                     </Link>
    //                 </Typography>
    //             </ListItemText>         
    //         </ListItem>
    //     )
    // }

    // renderFriends2 = () => {
    //         return (
    //             <Box
    //               sx={{ width: '100%', height: 400, maxWidth: 360, bgcolor: '#f06292', m:10, ml:16 }}>
    //                 <Typography variant="h6" component="div">
    //                     Friends
    //                 </Typography>
    //                 <Divider />
    //                 <FixedSizeList
    //                     height={400}
    //                     width={360}
    //                     itemSize={46}
    //                     itemCount={10}//{this.state.user.friends.length}
    //                     overscanCount={5}                    
    //                 >
    //                 {(props) => this.renderFriendsRow(props)}
    //               </FixedSizeList>
    //             </Box>
    //           );
    //     }

    renderFriends = () => {
        const friends = this.state.user.friends.map((el: any) => (
                <ListItem key={el.id}>
                    { (el.status==="offline" && !(this.state.currentUser && el.id === this.state.currentUser.id)) &&
                        <IconButton
                        color="error" >
                            <BlurOnIcon fontSize='small'/>
                        </IconButton>
                    }
                    { (el.status==="online" || (this.state.currentUser && el.id === this.state.currentUser.id)) &&
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

                    <ListItemText >
                        <Typography variant="body1">
                            <Link to={{ pathname:`/userinfo/${el.id}`} }>
                                {`${el.username}`}
                            </Link>
                        </Typography>
                    </ListItemText>         
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
                        <Typography variant='h2' sx={ {m:3} }>
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
                    {this.state.user && 
                    <Box sx={{bgcolor: '#f06292', ml:16 }}>
                        <Typography variant="h6" component="div">
                            Stats
                        </Typography>
                        <Divider />         
                        <Table sx={{bgcolor: '#f48fb1'}} size='small'>
                            <TableBody>
                                <TableRow>
                                    <TableCell align="left" >Wins</TableCell>
                                    <TableCell align="right">{this.state.user.gameStats && this.state.user.gameStats.wins}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell align="left" >Losses</TableCell>
                                    <TableCell align="right">{(this.state.user.gameStats && this.state.user.gameStats.losses)}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell align="left" >
                                    <Link to={{ pathname:`/leaderboard`} }>
                                        Ranking
                                    </Link>                                        
                                    </TableCell>
                                    <TableCell align="right">
                                        {this.state.ranking}                                        
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Box>}
                </Stack>

                <Stack direction="row">
                    <Box sx={{minWidth:250, bgcolor: '#f06292', m:10, mr: 16}}>
                        <Typography variant="h6" component="div">
                            Friends
                        </Typography>
                        <Divider />
                        {this.state.user && this.renderFriends()}
                    </Box>
                    <Box sx={{minWidth:250, bgcolor: '#f06292', m:10, ml:16 }}>
                        <Typography variant="h6" component="div">
                            Matches
                        </Typography>
                        <Divider />
                        {this.state.user && this.renderMatches()}
                    </Box>
                    {/* {this.renderFriends2()} */}
                    {/* {this.renderMatches2()} */}
                </Stack>
            </div>
        )
    }
}

export default withParams(UserInfo)