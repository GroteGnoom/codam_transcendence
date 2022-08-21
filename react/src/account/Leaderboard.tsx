import { Avatar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { get_backend_host } from "../utils";


interface LeaderboardProps {
    navigation: any;
}

interface LeaderboardState { 
    userStats: any[];    
}

class Leaderboard extends React.Component<LeaderboardProps, LeaderboardState> {
    constructor(props: LeaderboardProps){
        super(props);
        this.state = { 
            userStats: [],
        }
    }

    li: any;

    getLeaderboard() {
        fetch(get_backend_host() + `/match/leaderboard`, { 
            method: 'GET',
            credentials: 'include',
        })
		.then((response) => response.json())
        .then((response) => {
            this.setState({ userStats: response });            
        })
    }

    async redirHome() {
        console.log("RedirHome");
        const { navigation } = this.props;
        this.li =  fetch(get_backend_host() + "/auth/amiloggedin", { 
            method: 'GET',
            credentials: 'include',
        }).then(response => response.json());
        console.log(await this.li);
        if (await this.li === false) {
            console.log("navigate");
            navigation("/", { replace: true });
            return;
        }
    }

    componentDidMount() {
        this.redirHome()
        if (this.li === false)
            return;
        this.getLeaderboard()
    }

    renderLeaderboard = () => {
        // console.log(this.state.userStats)   //array of gamestat entities
        const players = this.state.userStats.map((el: any, index: number) => {
            const avatar = {
                imgSrc: get_backend_host() + `/users/avatar/${el.user.id}`,
                imgHash: Date.now(), 
            }

            return (
                <TableRow 
                    key={el.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
                    <TableCell align="center" >{`${index + 1}`}</TableCell>
                    <TableCell align="right" style={{ width: 40 }}>
                        <Avatar
                            alt={el.user.intraName} // first letter of alt (alternative) text is default avatar if loading src fails
                            src={`${avatar.imgSrc}?${avatar.imgHash}`}
                            sx={{ height: 50, width: 50 }}
                        />
                    </TableCell>
                    <TableCell align="left" style={{ width: 300 }}>
                        <Link to={ el.user && { pathname:`/userinfo/${el.user.id}`} } style={{ color: '#e91e63' }}>
                                    {el.user && `${el.user.username}`}
                        </Link>
                    </TableCell>
                    <TableCell align="center" >{`${el.wins}`}</TableCell>
                    <TableCell align="center">{`${el.losses}`}</TableCell>
                </TableRow>
            )
        })
        return (
            <TableContainer style={{ maxHeight: 450 }}  sx={{bgcolor: '#f48fb1', maxWidth: '80%'}}>

            <Table stickyHeader sx={{bgcolor: '#f48fb1'}}>
                <TableHead sx={{bgcolor: '#e91e63', maxWidth: '80%'}}>
                    <TableRow>
                        <TableCell sx={{bgcolor: '#f48fb1'}}>                
                            <Typography variant='h6'>
                                Ranking
                            </Typography>  
                        </TableCell>
                        <TableCell sx={{bgcolor: '#f48fb1'}}>                
                            <Typography variant='h6'>
                                
                            </Typography>  
                        </TableCell>
                        <TableCell sx={{bgcolor: '#f48fb1'}}>                
                            <Typography variant='h6'>
                                Player
                            </Typography>  
                        </TableCell>
                        <TableCell align="center" sx={{bgcolor: '#f48fb1'}}>
                            <Typography variant='h6'>
                                Total wins
                            </Typography>  
                        </TableCell>
                        <TableCell align="center" sx={{bgcolor: '#f48fb1'}}>
                            <Typography variant='h6'>
                                Total losses
                            </Typography>  
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody sx={{maxHeight: 300}}>
                    {players}
                </TableBody>
            </Table>
            </TableContainer>
        );
    }

    render(){ 
        return (
            <div className="menu">
                <Typography variant='h2' sx={ {m:3} }>
                    Leaderboard
                </Typography>                
                { this.state.userStats && 
                    this.renderLeaderboard()
                } 
            </div>
        )
    }
}

export default function LeaderboardFunction(props: any) {
    const navigation = useNavigate();
    
    return <Leaderboard {...props} navigation={navigation} />;
}
