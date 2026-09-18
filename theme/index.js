import { createTheme } from '@mui/material/styles';
import { palette, fonts, radius, elevation } from './tokens';

/** MUI requires all 25 shadow slots. Ramp our four layers across them. */
function shadowScale(mode) {
  const e = elevation[mode];
  const ramp = [e[1], e[2], e[3], e[4]];
  return ['none', ...Array.from({ length: 24 }, (_, i) => ramp[Math.min(3, Math.floor(i / 6))])];
}

export default function buildTheme(mode = 'light') {
  const c = palette[mode];
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: { main: c.primary, dark: c.primaryHover, contrastText: c.onPrimary },
      secondary: { main: c.secondary, contrastText: c.onPrimary },
      background: { default: c.bg, paper: c.paper },
      text: { primary: c.ink, secondary: c.inkMuted },
      divider: c.border,
      success: { main: c.success },
      warning: { main: c.warning },
      error: { main: c.error },
      info: { main: c.info },
      // Custom slots consumed via theme.palette.surface.*
      surface: { raised: c.raised, border: c.border, borderStrong: c.borderStrong,
                 primarySoft: c.primarySoft, secondarySoft: c.secondarySoft },
    },

    shape: { borderRadius: radius.md },
    shadows: shadowScale(mode),

    typography: {
      fontFamily: fonts.body,
      // Elements of Typographic Style scale, tightened at display sizes.
      h1: { fontFamily: fonts.display, fontWeight: 400, fontSize: 'clamp(2.25rem, 5.5vw, 4rem)',
            lineHeight: 1.08, letterSpacing: '-0.015em' },
      h2: { fontFamily: fonts.display, fontWeight: 400, fontSize: 'clamp(1.75rem, 3.6vw, 2.6rem)',
            lineHeight: 1.15, letterSpacing: '-0.01em' },
      h3: { fontFamily: fonts.display, fontWeight: 400, fontSize: 'clamp(1.35rem, 2.4vw, 1.8rem)',
            lineHeight: 1.22 },
      h4: { fontFamily: fonts.display, fontWeight: 400, fontSize: '1.3rem', lineHeight: 1.3 },
      h5: { fontFamily: fonts.body, fontWeight: 600, fontSize: '1.05rem', lineHeight: 1.4 },
      h6: { fontFamily: fonts.body, fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.45 },
      subtitle1: { fontSize: '1.05rem', lineHeight: 1.6, color: c.inkMuted },
      subtitle2: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.5 },
      body1: { fontSize: '1rem', lineHeight: 1.7 },
      body2: { fontSize: '0.9rem', lineHeight: 1.65 },
      button: { fontWeight: 600, fontSize: '0.925rem', textTransform: 'none', letterSpacing: 0 },
      caption: { fontSize: '0.8rem', lineHeight: 1.5, color: c.inkMuted },
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: { WebkitFontSmoothing: 'antialiased', scrollBehavior: 'smooth' },
          body: { backgroundColor: c.bg, color: c.ink },
          '::selection': { background: c.primary, color: c.onPrimary },
          // Single visible focus treatment for every interactive element.
          ':focus-visible': { outline: `2px solid ${c.primary}`, outlineOffset: '2px' },
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': {
              animationDuration: '0.01ms !important',
              animationIterationCount: '1 !important',
              transitionDuration: '0.01ms !important',
              scrollBehavior: 'auto !important',
            },
          },
        },
      },

      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: radius.pill, paddingInline: 20, paddingBlock: 9,
            minHeight: 44, // touch target
            transition: 'background-color .18s, color .18s, border-color .18s, transform .18s',
            '&:active': { transform: 'translateY(1px)' },
          },
          containedPrimary: { '&:hover': { backgroundColor: c.primaryHover } },
          outlined: { borderColor: c.borderStrong, '&:hover': { borderColor: c.primary, backgroundColor: c.primarySoft } },
        },
      },

      MuiIconButton: { styleOverrides: { root: { transition: 'background-color .18s, color .18s' } } },

      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { backgroundImage: 'none', border: `1px solid ${c.border}` },
          elevation0: { border: 'none' },
        },
      },

      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { borderRadius: radius.lg, border: `1px solid ${c.border}`, backgroundColor: c.paper },
        },
      },

      MuiCardHeader: {
        styleOverrides: {
          title: { fontFamily: fonts.display, fontSize: '1.1rem', color: c.ink },
          subheader: { fontSize: '0.8rem', color: c.inkMuted },
        },
      },

      MuiAppBar: {
        defaultProps: { elevation: 0, color: 'transparent' },
        styleOverrides: { root: { backgroundImage: 'none' } },
      },

      MuiDialog: {
        styleOverrides: {
          paper: { borderRadius: radius.xl, border: `1px solid ${c.border}`, backgroundImage: 'none' },
        },
      },
      MuiDialogTitle: { styleOverrides: { root: { fontFamily: fonts.display, fontSize: '1.4rem' } } },

      MuiTextField: { defaultProps: { variant: 'outlined' } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: radius.md, backgroundColor: isDark ? c.raised : c.paper,
            '& fieldset': { borderColor: c.border },
            '&:hover fieldset': { borderColor: c.borderStrong },
            '&.Mui-focused fieldset': { borderColor: c.primary, borderWidth: 2 },
          },
        },
      },

      MuiMenu: { styleOverrides: { paper: { borderRadius: radius.lg, border: `1px solid ${c.border}` } } },
      MuiMenuItem: { styleOverrides: { root: { minHeight: 44, borderRadius: radius.sm, margin: '2px 6px' } } },
      MuiDrawer: { styleOverrides: { paper: { backgroundImage: 'none', borderColor: c.border } } },
      MuiAvatar: { styleOverrides: { root: { fontFamily: fonts.body, fontWeight: 600, backgroundColor: c.secondarySoft, color: c.secondary } } },
      MuiDivider: { styleOverrides: { root: { borderColor: c.border } } },
      MuiChip: { styleOverrides: { root: { borderRadius: radius.sm, fontWeight: 500 } } },
      MuiTooltip: {
        styleOverrides: {
          tooltip: { backgroundColor: c.ink, color: c.bg, fontSize: '0.78rem', borderRadius: radius.sm, padding: '6px 10px' },
        },
      },
      MuiBottomNavigation: { styleOverrides: { root: { backgroundColor: 'transparent', height: 'auto' } } },
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: { color: c.inkMuted, minWidth: 64, paddingBlock: 10, '&.Mui-selected': { color: c.primary } },
          label: { fontSize: '0.78rem', '&.Mui-selected': { fontSize: '0.78rem' } },
        },
      },
      MuiSkeleton: { styleOverrides: { root: { backgroundColor: isDark ? '#242C33' : '#E2E7EC' } } },
      MuiLink: { defaultProps: { underline: 'hover' }, styleOverrides: { root: { color: c.primary } } },
    },
  });
}
