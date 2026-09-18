import { Box, Typography } from '@mui/material';

/** An empty screen is an invitation to act: say what is missing and what to do. */
export default function EmptyState({ icon, title, description, action }) {
  return (
    <Box
      sx={{
        textAlign: 'center', py: { xs: 6, md: 9 }, px: 3,
        border: theme => `1px dashed ${theme.palette.surface.borderStrong}`,
        borderRadius: 3, backgroundColor: 'background.paper',
      }}
    >
      {icon && <Box sx={{ color: 'text.secondary', mb: 2, '& svg': { fontSize: 40 } }}>{icon}</Box>}
      <Typography variant="h3" component="p">{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, mx: 'auto', maxWidth: '44ch' }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 3 }}>{action}</Box>}
    </Box>
  );
}
