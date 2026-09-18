import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import buildTheme from './index';

export const STORAGE_KEY = 'colorMode';
const ColorModeContext = React.createContext({ mode: 'light', toggleMode: () => {} });
export const useColorMode = () => React.useContext(ColorModeContext);

/**
 * The server cannot read localStorage or the OS preference, so the first React
 * render is always 'light' on both server and client — that keeps hydration
 * byte-identical. The real mode is applied in an effect immediately after mount.
 * The pre-paint script in _document.js has already painted the correct page
 * background by then, so there is no visible flash.
 */
export default function ColorModeProvider({ children }) {
  const [mode, setMode] = React.useState('light');

  React.useEffect(() => {
    let resolved;
    try {
      resolved = window.localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      resolved = null; // private browsing / storage disabled
    }
    if (resolved !== 'light' && resolved !== 'dark') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    setMode(resolved);
  }, []);

  React.useEffect(() => {
    document.documentElement.dataset.colorMode = mode;
  }, [mode]);

  const toggleMode = React.useCallback(() => {
    setMode(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch (e) {
        /* storage unavailable — mode still applies for this session */
      }
      return next;
    });
  }, []);

  const theme = React.useMemo(() => buildTheme(mode), [mode]);
  const ctx = React.useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);

  return (
    <ColorModeContext.Provider value={ctx}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
