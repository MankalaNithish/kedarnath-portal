import { Button, DialogActions, DialogContent, TextField } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';

export default function PostForm() {
    return (
        <>
            <DialogTitle>Add Post</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Email Address"
                    type="email"
                    fullWidth
                    variant="standard"
                />
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleClose}>Subscribe</Button>
                </DialogActions>
            </DialogContent>
        </>
    )
}