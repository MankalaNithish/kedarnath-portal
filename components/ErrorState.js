import { Box, Button, Typography } from '@mui/material';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';

/** States what went wrong and how to fix it. No apology, no vagueness. */
export default function ErrorState({ title = 'That did not load', description, onRetry }) {
  return (
    <Box
      sx={{
        textAlign: 'center', py: { xs: 6, md: 8 }, px: 3,
        border: theme => `1px solid ${theme.palette.error.main}`,
        borderRadius: 3, backgroundColor: 'background.paper',
      }}
    >
      <Typography variant="h3" component="p">{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, mx: 'auto', maxWidth: '46ch' }}>
          {description}
        </Typography>
      )}
      {onRetry && (
        <Button onClick={onRetry} variant="outlined" startIcon={<RefreshOutlined />} sx={{ mt: 3 }}>
          Try again
        </Button>
      )}
    </Box>
  );
}
