import * as React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import {
  Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle,
  Stack, TextField, Typography,
} from '@mui/material';
import AddOutlined from '@mui/icons-material/AddOutlined';
import ForumOutlined from '@mui/icons-material/ForumOutlined';
import Layout from '@/components/layout';
import Toast from '@/components/Toast';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import { ReviewSkeleton } from '@/components/SkeletonCard';
import { useAnimation, fadeInUp, useStagger } from '@/components/motion';
import { loadFirestore, isFirebaseConfigured } from '@/lib/firebase';

const NAME_MAX = 80;
const REVIEW_MAX = 2000;

export default function Reviews() {

    const [reviews, setReviews] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [name, setName] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [error, setError] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [loadFailed, setLoadFailed] = React.useState(false);
    const [submitting, setSubmitting] = React.useState(false);
    const [toast, setToast] = React.useState({ open: false, message: '', severity: 'success' });

    const item = useAnimation(fadeInUp);
    const group = useStagger(0.05);

    /**
     * Live subscription. onSnapshot pushes a new array every time any visitor
     * adds a review, so the list stays current without a reload or any polling.
     * Ordering is by the client ISO date string, which is present the instant a
     * review is written, so a submission appears immediately with no flicker.
     */
    React.useEffect(() => {
        let unsubscribe = null;
        let cancelled = false;

        (async () => {
            const fb = await loadFirestore();
            if (!fb || cancelled) {
                setIsLoading(false);
                return;
            }

            unsubscribe = fb.onSnapshot(
                fb.query(fb.collection(fb.db, 'reviews'), fb.orderBy('date', 'desc')),
                snapshot => {
                    setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                    setLoadFailed(false);
                    setIsLoading(false);
                },
                e => {
                    console.error(e);
                    setLoadFailed(true);
                    setIsLoading(false);
                },
            );

            // Unmounted while the SDK was still loading.
            if (cancelled) unsubscribe();
        })();

        // Detach the listener when the page unmounts.
        return () => {
            cancelled = true;
            if (unsubscribe) unsubscribe();
        };
    }, []);

    function openModal() {
        setOpen(true);
    }

    function closeModal() {
        setOpen(false);
    }

    // Same validation rule as before: name and review are both required.
    async function submitReview() {
        if (!name.trim() || !description.trim()) {
            return setError(true);
        }

        const fb = await loadFirestore();
        if (!fb) {
            return setToast({ open: true, message: 'Reviews are not configured yet.', severity: 'error' });
        }

        setSubmitting(true);
        try {
            await fb.addDoc(fb.collection(fb.db, 'reviews'), {
                name: name.trim().slice(0, NAME_MAX),
                description: description.trim().slice(0, REVIEW_MAX),
                date: new Date().toISOString(),
            });
            // No refetch needed — the live listener delivers the new review.
            setOpen(false);
            setName('');
            setDescription('');
            setToast({ open: true, message: 'Your review is posted. Thank you.', severity: 'success' });
        } catch (e) {
            console.error(e);
            setToast({ open: true, message: 'Could not post your review. Please try again.', severity: 'error' });
        } finally {
            setSubmitting(false);
        }
    }

    const hasReviews = reviews.length > 0;

    return (
        <Layout>
            <Head>
                <title>Reviews &middot; Kedarnath Annadana Seva Samithi Siddipet</title>
                <meta name="description" content="What pilgrims and devotees say about the Kedarnath annadanam camp." />
            </Head>

            <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
                    spacing={2}
                    sx={{ mb: 5 }}
                >
                    <Box>
                        <Typography variant="h1" component="h1">Reviews</Typography>
                        <Typography variant="subtitle1" sx={{ mt: 2, maxWidth: '46ch' }}>
                            What pilgrims and devotees say about the camp.
                        </Typography>
                    </Box>
                    <Button
                        onClick={openModal}
                        variant="contained"
                        startIcon={<AddOutlined />}
                        disabled={!isFirebaseConfigured}
                        sx={{ flexShrink: 0 }}
                    >
                        Write a review
                    </Button>
                </Stack>

                {!isFirebaseConfigured ? (
                    <ErrorState
                        title="Reviews are not connected yet"
                        description="Add the six NEXT_PUBLIC_FIREBASE_* values from .env.example to .env, then restart the server."
                    />
                ) : isLoading ? (
                    <Box aria-busy="true" aria-live="polite">
                        <ReviewSkeleton />
                        <ReviewSkeleton />
                        <ReviewSkeleton />
                    </Box>
                ) : loadFailed ? (
                    <ErrorState
                        title="Reviews did not load"
                        description="The connection to the reviews database failed. Check your connection and try again."
                        onRetry={() => window.location.reload()}
                    />
                ) : !hasReviews ? (
                    <EmptyState
                        icon={<ForumOutlined />}
                        title="No reviews yet"
                        description="Be the first to write about your experience at the camp."
                        action={<Button onClick={openModal} variant="contained" startIcon={<AddOutlined />}>Write a review</Button>}
                    />
                ) : (
                    <motion.div variants={group} initial="hidden" animate="show">
                        <Stack spacing={2}>
                            {reviews.map(review => (
                                <motion.div key={review.id} variants={item}>
                                    <Box
                                        sx={{
                                            p: 3, borderRadius: 3, backgroundColor: 'background.paper',
                                            border: theme => `1px solid ${theme.palette.divider}`,
                                        }}
                                    >
                                        <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={2}>
                                            <Typography
                                                sx={{ fontFamily: theme => theme.typography.h1.fontFamily, fontSize: '1.15rem' }}
                                            >
                                                {review.name}
                                            </Typography>
                                            {review.date && (
                                                <Typography variant="caption" sx={{ flexShrink: 0 }}>
                                                    {new Date(review.date).toDateString()}
                                                </Typography>
                                            )}
                                        </Stack>
                                        <Typography
                                            variant="body1"
                                            color="text.secondary"
                                            sx={{ mt: 1.5, whiteSpace: 'pre-line' }}
                                        >
                                            {review.description}
                                        </Typography>
                                    </Box>
                                </motion.div>
                            ))}
                        </Stack>
                    </motion.div>
                )}
            </Container>

            <Dialog open={open} onClose={closeModal} fullWidth maxWidth="sm">
                <DialogTitle>Write a review</DialogTitle>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ mt: 1 }}>
                        <TextField
                            autoFocus
                            required
                            id="name"
                            label="Your name"
                            fullWidth
                            value={name}
                            inputProps={{ maxLength: NAME_MAX }}
                            onChange={(event) => {setError(false); setName(event.target.value)}}
                        />
                        <TextField
                            required
                            id="description"
                            label="Your review"
                            fullWidth
                            multiline
                            minRows={4}
                            value={description}
                            inputProps={{ maxLength: REVIEW_MAX }}
                            onChange={(event) => {setError(false); setDescription(event.target.value)}}
                        />
                        {error && (
                            <Typography variant="body2" color="error">Please fill all required fields</Typography>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={closeModal}>Cancel</Button>
                    <Button onClick={submitReview} variant="contained" disabled={submitting}>
                        {submitting ? 'Posting…' : 'Post review'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Toast toast={toast} onClose={() => setToast(t => ({ ...t, open: false }))} />
        </Layout>
    )
}
