import { Alert, Snackbar } from '@mui/material';

/**
 * Single feedback surface, replacing the native alert() calls.
 * Controlled by a { open, message, severity } object.
 */
export default function Toast({ toast, onClose }) {
  return (
    <Snackbar
      open={Boolean(toast?.open)}
      autoHideDuration={5000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity={toast?.severity || 'info'} variant="filled" sx={{ width: '100%' }}>
        {toast?.message}
      </Alert>
    </Snackbar>
  );
}
