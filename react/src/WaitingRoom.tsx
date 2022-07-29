import { pink } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const pinkTheme = createTheme({ palette: { primary: pink } })


const WaitingRoom = () => {
    let navigate = useNavigate();
    setTimeout(() => {
            navigate("/pinkpong", { replace: true });
        }, 3000);
    return (
        <ThemeProvider theme={pinkTheme}>
            <main>

            </main>
        </ThemeProvider>
    )
}

export default WaitingRoom;
