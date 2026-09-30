import { Card, CardActionArea, CardMedia, Chip, Stack, Typography } from '@mui/material';
import Link from 'next/link';

/**
 * Public news card (grid + featured hero variants) for pages/news.js.
 * Links to /news/[slug]; renders cleanly when an article has no cover.
 */
export default function NewsCard({ article, featured = false }) {
    const date = article.publishedAt
        ? new Date(article.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        : null;

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                maxWidth: featured ? 720 : undefined,
                margin: 'auto',
                borderRadius: 2,
            }}
        >
            <CardActionArea
                component={Link}
                href={`/news/${article.slug}`}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
            >
                {article.coverUrl && (
                    <CardMedia
                        component="img"
                        image={article.coverUrl}
                        alt={article.title}
                        loading="lazy"
                        sx={{ width: '100%', height: featured ? 260 : 170, objectFit: 'cover' }}
                    />
                )}
                <Stack spacing={1} sx={{ p: 2.5, pt: 2, width: '100%' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        {article.category && <Chip size="small" label={article.category} />}
                        {date && (
                            <Typography variant="caption" color="text.secondary">{date}</Typography>
                        )}
                    </Stack>
                    <Typography variant={featured ? 'h5' : 'subtitle1'} sx={{ fontWeight: 600 }}>
                        {article.title}
                    </Typography>
                    {article.summary && (
                        <Typography variant="body2" color="text.secondary">
                            {article.summary}
                        </Typography>
                    )}
                </Stack>
            </CardActionArea>
        </Card>
    );
}
