import { useState } from "react";
import { Box, IconButton, Stack } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";

export default function PostImage({images}) {
    const [index, setIndex] = useState(0);
    const totalImages = images.length;

    function setImageIndex(type) {
        if (type === 'up') {
            setIndex(prevIndex => prevIndex + 1);
        }
        if (type === 'down') {
            setIndex(prevIndex => prevIndex - 1);
        }
    }

    const current = images[index];

    return (
        <Box>
            <Box
                sx={{
                    position: 'relative', borderRadius: 2, overflow: 'hidden',
                    backgroundColor: theme => theme.palette.surface.raised,
                    border: theme => `1px solid ${theme.palette.divider}`,
                }}
            >
                {/*
                  A plain <img>: the source is a base64 data URI built from the
                  Mongo Buffer, and next/image cannot size an unmeasured data URI.
                */}
                <Box
                    component="img"
                    src={`data:${current.contentType};base64,${current.data}`}
                    alt={current.originalName || `Photograph ${index + 1} of ${totalImages}`}
                    sx={{ display: 'block', width: '100%', maxHeight: 460, objectFit: 'contain' }}
                />
            </Box>

            {totalImages > 1 && (
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.5} sx={{ mt: 1 }}>
                    <IconButton
                        onClick={() => setImageIndex('down')}
                        disabled={index === 0}
                        aria-label="Previous photograph"
                        size="small"
                    >
                        <ChevronLeft />
                    </IconButton>

                    <Stack direction="row" spacing={0.75} alignItems="center">
                        {images.map((img, i) => (
                            <Box
                                key={i}
                                sx={{
                                    width: i === index ? 18 : 6, height: 6, borderRadius: 3,
                                    transition: 'width .22s, background-color .22s',
                                    backgroundColor: theme =>
                                        i === index ? theme.palette.primary.main : theme.palette.surface.borderStrong,
                                }}
                            />
                        ))}
                    </Stack>

                    <IconButton
                        onClick={() => setImageIndex('up')}
                        disabled={index === totalImages - 1}
                        aria-label="Next photograph"
                        size="small"
                    >
                        <ChevronRight />
                    </IconButton>
                </Stack>
            )}
        </Box>
    )
}
