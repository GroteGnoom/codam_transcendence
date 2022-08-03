import React, { Component } from "react";
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import { Typography } from "@mui/material";
import { useParams } from "react-router-dom";

function withParams(Component: any) {
  return (props: any) => <Component {...props} params={useParams()} />;
}

interface UserInfoProps { 
    params: any;
}

interface UserInfoState { 
    user: any;
}

class UserInfo extends React.Component<UserInfoProps, UserInfoState> {
    constructor(props: UserInfoProps){
        super(props);
        this.state = { 
            user: undefined,
        }
    }

    getUserInfo() {
        fetch(`http://127.0.0.1:5000/users/id/${this.props.params.id}`, { method: 'GET'})
		.then((response) => response.json())
        .then((response) => {
            this.setState({ user: response });            
        })
    }

    componentDidMount() {
        const id = this.props.params;
        console.log(id)
    }

    render(){ 

        return (
            // render user etc. when database is updated!
            <div className="menu">
                {this.state.user && <Typography variant='h1'>
                    {this.state.user.username}
                </Typography>}
                <Badge className="item"
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                    // Avatar to make the Icon circular
                    <Avatar
                        style={{
                            backgroundColor: '#fcc6ff'
                        }}>
                    </Avatar>
                    }>
                </Badge>

            </div>
        )
    }
}

export default withParams(UserInfo)