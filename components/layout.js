import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
  AppBar, Box, Container, Divider, Drawer, IconButton, Stack, Toolbar, Typography, useScrollTrigger,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { Facebook, Mail, Payments } from '@mui/icons-material';
import ThemeToggle from './ThemeToggle';
import { useAnimation, fadeInUp, useStagger } from './motion';

// Same five destinations as before. Hrefs are now absolute so they resolve
// identically from any path; Posts and Member Login remain out of the nav and
// reachable directly at /posts and /login.
const pages = [
  { displayName: 'Home', route: '/' },
  { displayName: 'Members', route: '/members' },
  { displayName: 'About', route: '/about' },
  { displayName: 'Reviews', route: '/reviews' },
  { displayName: 'Donation', route: '/donation' },
];

const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=100083534350470';
const MAIL_URL = 'mailto:nithish.fourns@gmail.com';

function NavLink({ page, active, onClick }) {
  return (
    <Box
      component={Link}
      href={page.route}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      sx={{
        position: 'relative', px: 1.5, py: 1, borderRadius: 1,
        fontSize: '0.925rem', fontWeight: active ? 600 : 500,
        color: active ? 'text.primary' : 'text.secondary',
        transition: 'color .18s',
        '&:hover': { color: 'text.primary' },
      }}
    >
      {page.displayName}
      {active && (
        <motion.span
          layoutId="nav-active"
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          style={{
            position: 'absolute', left: 12, right: 12, bottom: 2, height: 2,
            borderRadius: 2, background: 'currentColor',
          }}
        />
      )}
    </Box>
  );
}

export default function Layout({ children }) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const router = useRouter();
  const condensed = useScrollTrigger({ disableHysteresis: true, threshold: 12 });
  const item = useAnimation(fadeInUp);
  const group = useStagger(0.05);

  const isActive = route => (route === '/' ? router.pathname === '/' : router.pathname.startsWith(route));

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <a className="skip-link" href="#main-content">Skip to content</a>

      <AppBar
        position="sticky"
        sx={{
          backdropFilter: 'saturate(180%) blur(12px)',
          backgroundColor: theme =>
            theme.palette.mode === 'dark' ? 'rgba(16,20,24,.78)' : 'rgba(235,238,241,.78)',
          borderBottom: theme => `1px solid ${condensed ? theme.palette.divider : 'transparent'}`,
          transition: 'border-color .2s, background-color .2s',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            disableGutters
            sx={{ minHeight: { xs: 60, md: condensed ? 64 : 76 }, transition: 'min-height .2s', gap: 2 }}
          >
            <Box
              component={Link}
              href="/"
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flexShrink: 0 }}
            >
              <Image
                src="/kedarnath_profile.jpg"
                width={40}
                height={40}
                alt=""
                style={{ borderRadius: '50%', objectFit: 'cover' }}
              />
              <Box sx={{ minWidth: 0, display: { xs: 'none', sm: 'block' } }}>
                <Typography
                  sx={{ fontFamily: theme => theme.typography.h1.fontFamily, fontSize: '1.02rem', lineHeight: 1.2 }}
                >
                  Kedarnath Annadana Seva Samithi
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.2 }}>
                  Siddipet
                </Typography>
              </Box>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
              {pages.map(page => (
                <NavLink key={page.route} page={page} active={isActive(page.route)} />
              ))}
              <Box sx={{ width: 8 }} />
              <ThemeToggle />
            </Stack>

            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ display: { xs: 'flex', md: 'none' } }}>
              <ThemeToggle />
              <IconButton
                onClick={() => setDrawerOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={drawerOpen}
                sx={{ color: 'text.primary' }}
              >
                <MenuIcon />
              </IconButton>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '82vw', sm: 340 }, px: 2, py: 2 } }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="h6" component="p">Menu</Typography>
          <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close navigation menu">
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider sx={{ mb: 1 }} />
        <motion.nav variants={group} initial="hidden" animate="show">
          {pages.map(page => {
            const active = isActive(page.route);
            return (
              <motion.div key={page.route} variants={item}>
                <Box
                  component={Link}
                  href={page.route}
                  onClick={() => setDrawerOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  sx={{
                    display: 'flex', alignItems: 'center', minHeight: 52, px: 2, borderRadius: 2,
                    fontSize: '1.05rem', fontWeight: active ? 600 : 500,
                    color: active ? 'primary.main' : 'text.primary',
                    backgroundColor: theme => (active ? theme.palette.surface.primarySoft : 'transparent'),
                  }}
                >
                  {page.displayName}
                </Box>
              </motion.div>
            );
          })}
        </motion.nav>
      </Drawer>

      <Box component="main" id="main-content" sx={{ flex: 1 }}>
        {children}
      </Box>

      <Box component="footer" sx={{ mt: 8, borderTop: theme => `1px solid ${theme.palette.divider}` }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={3}
          >
            <Box>
              <Typography sx={{ fontFamily: theme => theme.typography.h1.fontFamily, fontSize: '1.05rem' }}>
                Kedarnath Annadana Seva Samithi
              </Typography>
              <Typography variant="caption" sx={{ display: 'block' }}>
                Siddipet &middot; Regd. No. 4/2020
              </Typography>
            </Box>

            {/* Same three actions as the previous BottomNavigation. */}
            <Stack direction="row" spacing={1}>
              <IconButton
                aria-label="Open our Facebook page in a new tab"
                onClick={() => window.open(FACEBOOK_URL, '_blank')}
                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
              >
                <Facebook />
              </IconButton>
              <IconButton
                aria-label="Email the samithi"
                onClick={() => window.open(MAIL_URL, '_blank')}
                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
              >
                <Mail />
              </IconButton>
              <IconButton
                aria-label="Go to the donation page"
                onClick={() => router.push('/donation')}
                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
              >
                <Payments />
              </IconButton>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
