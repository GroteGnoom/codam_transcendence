import { Avatar, Box, Divider, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { get_backend_host } from "../utils";


interface LeaderboardProps {}

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

    componentDidMount() {
        this.getLeaderboard()
    }

    renderLeaderboard = () => {
        console.log(this.state.userStats)   //array of gamestat entities
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
                            alt={el.user.username} // first letter of alt (alternative) text is default avatar if loading src fails
                            src={`${avatar.imgSrc}?${avatar.imgHash}`}
                            sx={{ height: 50, width: 50 }}
                        />
                    </TableCell>
                    <TableCell align="left" style={{ width: 300 }}>
                        <Link to={ el.user && { pathname:`/userinfo/${el.user.id}`} }>
                                    {el.user && `${el.user.username}`}
                        </Link>
                    </TableCell>
                    <TableCell align="right" >{`${el.wins}`}</TableCell>
                    <TableCell align="right">{`${el.losses}`}</TableCell>
                </TableRow>
            )
        })
        return (
            <Table sx={{bgcolor: '#f48fb1', maxWidth: '80%'}}>
                <TableHead sx={{bgcolor: '#e91e63', maxWidth: '80%'}}>
                    <TableRow>
                        <TableCell>                
                            <Typography variant='h6'>
                                Ranking
                            </Typography>  
                        </TableCell>
                        <TableCell>                
                            <Typography variant='h6'>
                                
                            </Typography>  
                        </TableCell>
                        <TableCell>                
                            <Typography variant='h6'>
                                Player
                            </Typography>  
                        </TableCell>
                        <TableCell align="right">
                            <Typography variant='h6'>
                                Total wins
                            </Typography>  
                        </TableCell>
                        <TableCell align="right">
                            <Typography variant='h6'>
                                Total losses
                            </Typography>  
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {players}
                </TableBody>
            </Table>
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

export default Leaderboard