import { useCallback, useEffect, useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

/**
 * Fullscreen lightbox for the gallery. Supports arrow keys, Esc, and on-screen
 * buttons; skips items without images. Renders nothing when closed.
 */
export default function GalleryLightbox({ items, index, onClose, onChangeIndex }) {
    const [announce, setAnnounce] = useState('');

    const open = index !== null && items && items[index];

    const goTo = useCallback((next) => {
        if (!items || items.length === 0) return;
        const bounded = (next + items.length) % items.length;
        onChangeIndex(bounded);
        setAnnounce(`Photo ${bounded + 1} of ${items.length}`);
    }, [items, onChangeIndex]);

    useEffect(() => {
        if (!open) return undefined;
        const onKey = (event) => {
            if (event.key === 'Escape') onClose();
            if (event.key === 'ArrowRight') goTo(index + 1);
            if (event.key === 'ArrowLeft') goTo(index - 1);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, index, onClose, goTo]);

    if (!open) return null;

    const item = items[index];
    const caption = item.caption || item.title || '';

    return (
        <Box
            role="dialog"
            aria-modal="true"
            aria-label={caption ? `Photo: ${caption}` : 'Photo viewer'}
            sx={{
                position: 'fixed',
                inset: 0,
                zIndex: (theme) => theme.zIndex.modal + 1,
                bgcolor: 'rgba(10, 12, 18, 0.92)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <IconButton
                aria-label="Close viewer"
                onClick={onClose}
                sx={{ position: 'absolute', top: { xs: 8, md: 16 }, right: { xs: 8, md: 16 }, color: '#fff' }}
            >
                <CloseIcon />
            </IconButton>

            <IconButton
                aria-label="Previous photo"
                onClick={() => goTo(index - 1)}
                sx={{ position: 'absolute', left: { xs: 4, md: 24 }, top: '50%', color: '#fff' }}
            >
                <ChevronLeftIcon fontSize="large" />
            </IconButton>

            <IconButton
                aria-label="Next photo"
                onClick={() => goTo(index + 1)}
                sx={{ position: 'absolute', right: { xs: 4, md: 24 }, top: '50%', color: '#fff' }}
            >
                <ChevronRightIcon fontSize="large" />
            </IconButton>

            <Box
                component="img"
                src={item.imageUrl}
                alt={caption || 'Camp photograph'}
                sx={{
                    maxWidth: '92vw',
                    maxHeight: { xs: '70vh', md: '78vh' },
                    objectFit: 'contain',
                    borderRadius: 2,
                }}
            />

            <Box sx={{ mt: 2, textAlign: 'center', px: 3, maxWidth: 720 }}>
                {caption && (
                    <Typography sx={{ color: '#fff', fontWeight: 600 }}>{caption}</Typography>
                )}
                {item.description && (
                    <Typography sx={{ color: 'rgba(255,255,255,0.78)', mt: 0.5 }}>
                        {item.description}
                    </Typography>
                )}
                <Typography sx={{ color: 'rgba(255,255,255,0.55)', mt: 1, fontSize: 13 }}>
                    Photo {index + 1} of {items.length}
                </Typography>
                {/* Live region so screen readers hear photo changes on arrow keys. */}
                <Box aria-live="polite" sx={visuallyHidden} role="status">{announce}</Box>
            </Box>
        </Box>
    );
}

const visuallyHidden = {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
};
