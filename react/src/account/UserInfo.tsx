import { Button, Typography } from "@mui/material";
import React from "react";
import { useParams } from "react-router-dom";

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
        fetch(`http://127.0.0.1:5000/users/id/${this.props.params.id}`, { 
            method: 'GET'
        })
		.then((response) => response.json())
        .then((response) => {
            this.setState({ user: response });            
        })
    }

    blockUser() {
        fetch(`http://127.0.0.1:5000/users/block/${this.props.params.id}`, { 
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