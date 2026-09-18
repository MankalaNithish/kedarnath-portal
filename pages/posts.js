import * as React from 'react';
import Head from 'next/head';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, Fab, Stack, TextField, Typography,
} from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';
import PhotoLibraryOutlined from '@mui/icons-material/PhotoLibraryOutlined';
import Layout from '@/components/layout';
import OverflowText from '@/components/overflowtext';
import PostImage from '@/components/postimage';
import Toast from '@/components/Toast';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import { PostSkeleton } from '@/components/SkeletonCard';
import { useAnimation, fadeInUp } from '@/components/motion';
import environment from '@/environment';

export default function Posts() {

    const [data, setData] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [page, setPage] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const [files, setFiles] = React.useState(null);
    const [description, setDescription] = React.useState('');
    const [loadFailed, setLoadFailed] = React.useState(false);
    const [submitting, setSubmitting] = React.useState(false);
    const [toast, setToast] = React.useState({ open: false, message: '', severity: 'success' });
    // Held in a ref so the seen-ids set survives re-renders.
    const postIds = React.useRef([]);

    const item = useAnimation(fadeInUp);

    // Same endpoint and query parameters as before.
    async function getPosts() {
        return await axios(`${environment.apiUrl || ''}/api/v1/posts?limit=${10}&skip=${page*10}&sort={"_id":-1}`);
    }

    const fetchData = async () => {
        setIsLoading(true);
        try {
            let response = await getPosts();
            let slicedPosts = response.data;
            let postsToInsert = [];
            slicedPosts.forEach(post => {
                if (!postIds.current.includes(post._id.toString())) {
                    postIds.current.push(post._id.toString());
                    postsToInsert.push(post);
                }
            });
            setData(prevData => [...prevData, ...postsToInsert]);
            setPage(prevPage => prevPage + 1);
            setLoadFailed(false);
        } catch(e) {
            console.error(e);
            setLoadFailed(true);
        } finally {
            // Previously left true on failure, which froze the feed permanently.
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        if (scrollTop + clientHeight >= scrollHeight - 5 && !isLoading && !loadFailed) {
          fetchData();
        }
    };

    React.useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isLoading, loadFailed]);

    function handleFileChange(event) {
        setFiles(event.target.files || []);
    }

    function openModal() {
        setOpen(true);
    }

    function closeModal() {
        setOpen(false);
        setDescription('');
        setFiles(null);
    }

    // Same multipart payload and endpoint as before.
    async function submitPost() {
        const formData = new FormData();
        formData.append('description', description);
        // Guard added: files is null until the picker is used.
        if (files) {
            for (let i = 0; i < files.length; i++) {
                formData.append("images", files[i]);
            }
        }
        setSubmitting(true);
        try {
            await axios.post('/api/v1/createPost', formData);
            closeModal();
            setToast({ open: true, message: 'Post published.', severity: 'success' });
        } catch (e) {
            console.error(e);
            setToast({ open: true, message: 'Could not publish the post. Please try again.', severity: 'error' });
        } finally {
            setSubmitting(false);
        }
    }

    function isLoggedIn() {
        return typeof window !== 'undefined' && sessionStorage.getItem('isLoggedIn');
    }

    const fileCount = files ? files.length : 0;
    const isFirstLoad = isLoading && data.length === 0;

    return(
        <Layout>
            <Head>
                <title>Posts &middot; Kedarnath Annadana Seva Samithi Siddipet</title>
                <meta name="description" content="Updates and photographs from the Kedarnath annadanam camp." />
            </Head>

            <Container maxWidth="sm" sx={{ py: { xs: 5, md: 8 } }}>
                <Typography variant="h1" component="h1" sx={{ mb: 1 }}>Posts</Typography>
                <Typography variant="subtitle1" sx={{ mb: 5, maxWidth: '46ch' }}>
                    Updates and photographs from the camp.
                </Typography>

                {isFirstLoad ? (
                    <Box aria-busy="true" aria-live="polite">
                        <PostSkeleton />
                        <PostSkeleton />
                    </Box>
                ) : loadFailed && data.length === 0 ? (
                    <ErrorState
                        title="Posts did not load"
                        description="The server did not respond. Check your connection and try again."
                        onRetry={fetchData}
                    />
                ) : data.length === 0 ? (
                    <EmptyState
                        icon={<PhotoLibraryOutlined />}
                        title="No posts yet"
                        description="Updates from the camp will appear here once members start posting."
                    />
                ) : (
                    <Stack spacing={3}>
                        {data.map((post, index) => (
                            <motion.div
                                key={post._id || index}
                                variants={item}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true, margin: '-40px' }}
                            >
                                <Box
                                    sx={{
                                        borderRadius: 3, overflow: 'hidden', backgroundColor: 'background.paper',
                                        border: theme => `1px solid ${theme.palette.divider}`,
                                    }}
                                >
                                    <Box sx={{ px: 2.5, py: 2 }}>
                                        <Typography
                                            sx={{ fontFamily: theme => theme.typography.h1.fontFamily, fontSize: '1.05rem' }}
                                        >
                                            Kedarnath Annadana Seva Samithi
                                        </Typography>
                                        {post.date && (
                                            <Typography variant="caption">
                                                {new Date(post.date).toDateString()}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Divider />

                                    <Box sx={{ p: 2.5 }}>
                                        {post.images && post.images.length ? (
                                            <Box sx={{ mb: 2 }}>
                                                <PostImage images={post.images} />
                                            </Box>
                                        ) : null}
                                        <OverflowText text={post.description} maxLength={180} />
                                    </Box>

                                    <Divider />
                                    <Box sx={{ px: 2.5, py: 1.5 }}>
                                        <Typography variant="caption">By Nischith Kumar Mankala</Typography>
                                    </Box>
                                </Box>
                            </motion.div>
                        ))}

                        {isLoading && (
                            <Box aria-busy="true" aria-live="polite">
                                <PostSkeleton />
                            </Box>
                        )}
                    </Stack>
                )}
            </Container>

            {/* Same login gate as before. */}
            {isLoggedIn() ? (
                <Fab
                    color="primary"
                    onClick={openModal}
                    aria-label="Add post"
                    variant="extended"
                    sx={{ position: 'fixed', right: { xs: 16, md: 32 }, bottom: { xs: 16, md: 32 }, zIndex: 1200 }}
                >
                    <CreateIcon sx={{ mr: { xs: 0, md: 1 } }} />
                    <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>Add post</Box>
                </Fab>
            ) : null}

            <Dialog open={open} onClose={closeModal} fullWidth maxWidth="sm">
                <DialogTitle>Add post</DialogTitle>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ mt: 1 }}>
                        <TextField
                            autoFocus
                            id="description"
                            label="Post description"
                            fullWidth
                            multiline
                            minRows={3}
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                        />

                        <Box>
                            <Button component="label" variant="outlined" startIcon={<PhotoLibraryOutlined />}>
                                Choose photographs
                                <input
                                    hidden
                                    type="file"
                                    accept="image/jpeg, image/png, image/jpg"
                                    multiple
                                    onChange={handleFileChange}
                                />
                            </Button>
                            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                                {fileCount > 0
                                    ? `${fileCount} ${fileCount === 1 ? 'photograph' : 'photographs'} selected`
                                    : 'Up to 10 photographs, JPG or PNG.'}
                            </Typography>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={closeModal}>Cancel</Button>
                    <Button onClick={submitPost} variant="contained" disabled={submitting}>
                        {submitting ? 'Posting…' : 'Post'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Toast toast={toast} onClose={() => setToast(t => ({ ...t, open: false }))} />
        </Layout>
    )
}
