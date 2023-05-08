import Layout from "@/components/layout";
import { Box, Button, Card, CardContent, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid, TextField, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import postStyles from "@/styles/Post.module.css";
import { Create } from "@mui/icons-material";

export default function Reviews() {

    const [page, setPage] = useState(0);
    const [reviews, setReviews] = useState([]);
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState(false);

    async function fetchData() {
        try {
            let response = await axios.get(`api/v1/reviews?_sort=id&_order=desc&_page=${page + 1}`);
            setReviews(response.data);
        } catch(e) {
            console.log(e);
        }
    }

    useEffect(() => {
        fetchData();
    }, [])

    function openModal() {
        setOpen(true);
    }

    function closeModal() {
        setOpen(false);
    }

    async function submitReview() {
        if (!name || !description) {
            return setError(true);
        }
        let object = {
            name,
            description,
            date: new Date()
        };
        try {
            await axios.post('api/v1/reviews', object);
            setOpen(false);
            setPage(0);
            await fetchData();
        } catch (e) {
            console.error(e);
            alert('Unable to post your reivew please try later.');
        }
    }

    return (
        <Layout>
            <Grid container columns={1} sx={{width: '90%', margin: 'auto'}}>
                {reviews && reviews.length && reviews.map(review => {
                    return (
                        <Grid item sx={{width: '100%', marginBottom: '20px'}}
                            key={review.id}>
                            <Card sx={{borderRadius: '10px'}}>
                                <CardContent>
                                    <Typography variant="h5">
                                        {review.name}
                                    </Typography>
                                    {review.date &&
                                    <Typography variant="h8">
                                        {new Date(review.date || '').toDateString()}
                                    </Typography>}
                                    <Divider></Divider>
                                    <Typography color="text.secondary">
                                        {review.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    )
                })}
            </Grid>
            <Container maxWidth='lg'>
                <Box sx={{display: {xs: 'none', md: 'flex'}}}>
                    <Button className={postStyles.addPost} onClick={openModal}>Add Review</Button>
                </Box>
                <Box sx={{display: {xs: 'flex', md: 'none'}}}>
                    <Create className={postStyles.addPost} onClick={openModal}></Create>
                </Box>
            </Container>
            <Dialog open={open}>
                <DialogTitle>Add Review</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        required
                        margin="dense"
                        id="name"
                        label="Enter your Name"
                        fullWidth
                        variant="standard"
                        onChange={(event) => {setError(false); setName(event.target.value)}}
                        className={postStyles.descInput}
                    />
                    <TextField
                        required
                        margin="dense"
                        id="description"
                        label="Enter your Review"
                        fullWidth
                        variant="standard"
                        onChange={(event) => {setError(false); setDescription(event.target.value)}}
                        className={postStyles.descInput}
                    />
                    {/* <Input
                        type="file"
                        inputProps={{accept: 'image/jpeg, image/png, image/jpg', multiple: true}}
                        placeholder="Add the photos"
                        onChange={handleFileChange}
                        >
                    </Input> */}
                    <span style={{color: 'red'}}>{error ? 'Please fill all required fields': ''}</span>
                    <DialogActions>
                        <Button onClick={closeModal}>Cancel</Button>
                        <Button onClick={submitReview}>Post</Button>
                    </DialogActions>
                </DialogContent>
            </Dialog>
        </Layout>
    )
}