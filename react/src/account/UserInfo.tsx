import { Button, Typography } from "@mui/material";
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
    }

    componentDidMount() {
        this.getUserInfo()
    }

    render(){ 
        return (
            <div className="menu">
                {this.state.user && <Typography variant='h2'>
                    {this.state.user.username}
                </Typography>}
                <Button variant="contained" onClick={() => this.blockUser()}>
                    BLOCK
                </Button>
            </div>
        )
    }
}

export default withParams(UserInfo)