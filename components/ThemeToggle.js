import { IconButton, Tooltip } from '@mui/material';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import { useColorMode } from '@/theme/ColorModeProvider';

export default function ThemeToggle({ size = 'medium' }) {
  const { mode, toggleMode } = useColorMode();
  const label = mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <Tooltip title={label}>
      <IconButton onClick={toggleMode} size={size} aria-label={label} sx={{ color: 'text.secondary' }}>
        {mode === 'dark' ? <LightModeOutlined fontSize="small" /> : <DarkModeOutlined fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}
