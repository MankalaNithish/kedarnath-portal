import Head from 'next/head';
import Layout from "@/components/layout";
import { Alert, Box, Button, Container, Divider, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Login() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [hasError, setHasError] = useState(false);
    const router = useRouter();

    // Logic below is unchanged from the original page.
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
            <Head>
                <title>Member login &middot; Kedarnath Annadana Seva Samithi Siddipet</title>
                <meta name="robots" content="noindex" />
            </Head>

            <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
                <Box
                    sx={{
                        p: { xs: 3, md: 4 }, borderRadius: 4, backgroundColor: 'background.paper',
                        border: theme => `1px solid ${theme.palette.divider}`,
                        boxShadow: theme => theme.shadows[6],
                    }}
                >
                    {!isLoggedIn() ? (
                        <>
                            <Typography variant="h2" component="h1" sx={{ fontSize: { xs: '1.8rem', md: '2.1rem' } }}>
                                Member login
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                For samithi members who post updates from the camp.
                            </Typography>

                            <Divider sx={{ my: 3 }} />

                            <Stack spacing={2.5}>
                                <TextField
                                    label="Username"
                                    id="username"
                                    fullWidth
                                    autoComplete="username"
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                                <TextField
                                    label="Password"
                                    type="password"
                                    id="password"
                                    fullWidth
                                    autoComplete="current-password"
                                    onChange={(e) => setPassword(e.target.value)}
                                />

                                {hasError && (
                                    <Alert severity="error">Your login credentials are not correct</Alert>
                                )}

                                <Button onClick={login} variant="contained" size="large" fullWidth>
                                    Log in
                                </Button>
                            </Stack>
                        </>
                    ) : (
                        <Stack spacing={2.5} alignItems="flex-start">
                            <Typography variant="h2" component="h1" sx={{ fontSize: { xs: '1.8rem', md: '2.1rem' } }}>
                                You are logged in
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                You can add posts from the camp while this session is open.
                            </Typography>
                            <Button onClick={logout} variant="outlined">Log out</Button>
                        </Stack>
                    )}
                </Box>
            </Container>
        </Layout>
    )
}
