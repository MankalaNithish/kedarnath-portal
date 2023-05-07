import Layout from "@/components/layout";
import { Button, Divider, Grid, Paper, TextField } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Login() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [hasError, setHasError] = useState(false);
    const router = useRouter();

    function login() {
        if (username !== 'kedarnathadmin') {
            setHasError(true);
        }
        if (password !== 'adminkedar3456') {
            setHasError(true);
        }
        typeof window !== 'undefined' && sessionStorage.setItem('isLoggedIn', true);
        router.push('/');
    }

    function isLoggedIn() {
        return typeof window !== 'undefined' && sessionStorage.getItem('isLoggedIn');
    }

    function logout() {
        typeof window !== 'undefined' && sessionStorage.removeItem('isLoggedIn');
        router.push('/');
    }

    return (
        <Layout>
            <Paper
                sx={{margin: 'auto', width: {xs: '90%', md: '60%', lg: '40%'}}}
                elevation={6}
            >
                { !isLoggedIn() ? <><div style={{height: '50px'}}>
                    <span style={{fontSize: '30px'}}>Login</span>
                </div>
                <Divider/>
                <Grid container
                    direction="column"
                    alignItems="center"
                    spacing={2}
                    sx={{paddingTop: '5%', paddingBottom: '5%'}}>
                    <Grid item>
                        <TextField variant="outlined" label="Username"
                            id={'username'}
                            onChange={(e) => setUsername(e.target.value)}></TextField>
                    </Grid>
                    <Grid item>
                        <TextField 
                            variant="outlined"
                            label="Password"
                            type="password"
                            id={'password'}
                            onChange={(e) => setPassword(e.target.value)}
                        ></TextField>
                    </Grid>
                    <Grid item>
                        <span style={{color: 'red'}}>{hasError ? 'Your Login Credentials are not correct': ''}</span>
                    </Grid>
                    <Grid item>
                        <Button onClick={login}>Login</Button>
                    </Grid>
                </Grid></>
                :
                <div style={{justifyContent: 'center', display: 'flex'}}>
                    <Button onClick={logout}>Logout</Button>
                </div> 
                }
            </Paper>
        </Layout>
    )
}