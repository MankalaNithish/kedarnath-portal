import {
    Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button,
} from '@mui/material';

/**
 * App-wide destructive-action confirmation dialog. Wraps MUI Dialog with the
 * project's standard cancel/danger-confirm buttons and sane focus defaults.
 */
export default function ConfirmDialog({
    open,
    title = 'Are you sure?',
    message = '',
    confirmLabel = 'Delete',
    busy = false,
    onConfirm,
    onClose,
}) {
    return (
        <Dialog
            open={open}
            onClose={busy ? undefined : onClose}
            aria-labelledby="confirm-dialog-title"
        >
            <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{message}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={busy}>Cancel</Button>
                <Button onClick={onConfirm} disabled={busy} color="error" variant="contained" autoFocus>
                    {busy ? 'Working…' : confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
