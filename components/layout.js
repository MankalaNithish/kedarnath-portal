import * as React from 'react';
import Image from "next/image";
import Link from "next/link";
import styles from '@/styles/Home.module.css'
import { AppBar, BottomNavigation, BottomNavigationAction, Box, Button, Container, IconButton, Menu, MenuItem, Toolbar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Facebook, Mail, Payments } from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const pages = [
    {
        displayName: 'Home',
        route: '/'
    },
    {
        displayName: 'Members',
        route: 'members'
    },
    {
        displayName: 'Posts',
        route: 'posts'
    },
    {
        displayName: 'About',
        route: 'about'
    },
    {
        displayName: 'Member Login',
        route: 'login'
    },
];

export default function Layout({children}) {
    const [anchorElNav, setAnchorElNav] = React.useState(null);
    const router = useRouter();

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    React.useEffect(() => {}, []);

    return (
        <main className={styles.main}>
            <AppBar position="static">
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        <Box sx={{display: {xs: 'none', md: 'flex'}}}>
                            <div className={styles.header}>
                                <Image src='/kedarnath_profile.jpg'
                                    width={100}
                                    height={100}
                                    alt='Kedarnath annadana seva samithi profile picture'></Image>
                                {pages.map(({displayName, route}, index) => (
                                    <Link href={route}
                                        className={styles.link}
                                        key={index}
                                    >
                                        {displayName}
                                    </Link>
                                ))}
                            </div>
                        </Box>
                        <Box sx={{
                            display: {xs: 'block', md:'none'}
                            }}
                        >
                            <Image src='/kedarnath_profile.jpg'
                                width={50}
                                height={50}
                                alt='Kedarnath annadana seva samithi profile picture'
                            >
                            </Image>
                            <IconButton
                                size="large"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleOpenNavMenu}
                                color="inherit"
                                sx={{marginRight: 0, float: 'right'}}
                                >
                            <MenuIcon/>
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorElNav}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                                open={Boolean(anchorElNav)}
                                onClose={handleCloseNavMenu}
                                sx={{
                                    display: { xs: 'block', md: 'none' },
                                }}
                                >
                                {pages.map(({displayName, route}, index) => (
                                    <MenuItem key={index} onClick={handleCloseNavMenu}>
                                        <Link href={route} key={index}>{displayName}</Link>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
            <div>{children}</div>
            <BottomNavigation sx={{backgroundColor: 'grey', bottom: '0px'}} showLabels>
                <BottomNavigationAction
                    label='Facebook' 
                    icon={<Facebook/>}
                    onClick={() => window.open('https://www.facebook.com/profile.php?id=100083534350470', '_blank')}
                ></BottomNavigationAction>
                <BottomNavigationAction
                    label='Gmail' 
                    icon={<Mail/>}
                    onClick={() => window.open('mailto:nithish.fourns@gmail.com', '_blank')}
                ></BottomNavigationAction>
                <BottomNavigationAction
                    label='Donation'
                    icon={<Payments/>}
                    onClick={() => router.push('/donation')}
                >
                </BottomNavigationAction>
            </BottomNavigation>
        </main>
    )
}