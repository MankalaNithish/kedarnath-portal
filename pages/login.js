import Head from 'next/head';
import Layout from "@/components/layout";
import Toast from "@/components/Toast";
import { Alert, Box, Button, Container, Divider, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Login() {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [hasError, setHasError] = useState(false);
    const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
    const router = useRouter();

    // Server-side login first: a success sets the signed HttpOnly session
    // cookie that the /admin portal and the gallery/news APIs require, then
    // goes straight to the admin portal — that is where the "Upload photos"
    // and "Write article" buttons live; the public /gallery and /news pages
    // are visitor views and never show them. If the auth API is unreachable
    // (e.g. static hosting), fall back to the original client-side check so
    // the page keeps its historical behavior.
    async function login() {
        setHasError(false);
        try {
            const res = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ username, password }),
            });
            if (res.ok) {
                typeof window !== 'undefined' && sessionStorage.setItem('isLoggedIn', true);
                router.push('/admin');
                return;
            }
            setHasError(true);
            return;
        } catch {
            // API not reachable — fall through to the legacy client-side check.
        }
        if (username !== 'kedarnathadmin' || password !== 'adminkedar3456') {
            setHasError(true);
            return;
        }
        setToast({
            open: true,
            message: 'Signed in locally. The admin portal and photo APIs need the Node server (npm start).',
            severity: 'warning',
        });
        typeof window !== 'undefined' && sessionStorage.setItem('isLoggedIn', true);
        router.push('/admin');
    }

    function isLoggedIn() {
        return typeof window !== 'undefined' && sessionStorage.getItem('isLoggedIn');
    }

    function logout() {
        // Clear both the legacy flag and the server session cookie.
        typeof window !== 'undefined' && sessionStorage.removeItem('isLoggedIn');
        fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {});
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
                                You can add posts, manage the gallery and publish news while this session is open.
                            </Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                                <Button component="a" href="/admin" variant="contained">Go to admin portal</Button>
                                <Button onClick={logout} variant="outlined">Log out</Button>
                            </Stack>
                        </Stack>
                    )}
                </Box>
            </Container>

            <Toast toast={toast} onClose={() => setToast(t => ({ ...t, open: false }))} />
        </Layout>
    )
}
