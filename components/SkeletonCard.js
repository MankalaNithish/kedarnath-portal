import { Box, Card, Grid, Skeleton, Stack } from '@mui/material';

/** Content-shaped placeholders — they match the real card's proportions. */
export function PostSkeleton() {
  return (
    <Card sx={{ p: 2.5, mb: 3 }}>
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box sx={{ flex: 1 }}>
          <Skeleton width="45%" height={18} />
          <Skeleton width="25%" height={14} />
        </Box>
      </Box>
      <Skeleton variant="rounded" height={220} sx={{ mb: 2 }} />
      <Skeleton width="92%" height={16} />
      <Skeleton width="78%" height={16} />
    </Card>
  );
}

export function ReviewSkeleton() {
  return (
    <Card sx={{ p: 2.5, mb: 2 }}>
      <Skeleton width="35%" height={22} />
      <Skeleton width="18%" height={14} sx={{ mb: 1.5 }} />
      <Skeleton width="96%" height={16} />
      <Skeleton width="70%" height={16} />
    </Card>
  );
}

/** Row of shimmering bars for list-style admin tables. */
export function AdminRowSkeleton({ rows = 4 }) {
  return (
    <Stack spacing={1.5}>
      {Array.from({ length: rows }).map((_, index) => (
        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Skeleton variant="rectangular" width={72} height={48} sx={{ borderRadius: 1 }} />
          <Skeleton variant="text" sx={{ flexGrow: 1 }} />
          <Skeleton variant="rectangular" width={88} height={32} sx={{ borderRadius: 1 }} />
        </Box>
      ))}
    </Stack>
  );
}

/** Grid of gallery-photo placeholders. */
export function GallerySkeleton({ count = 8 }) {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={6} sm={4} md={3} key={index}>
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
        </Grid>
      ))}
    </Grid>
  );
}

/** Grid of news-card placeholders (cover bar + text lines). */
export function NewsSkeleton({ count = 6 }) {
  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card>
            <Skeleton variant="rectangular" height={150} />
            <Box sx={{ p: 2 }}>
              <Skeleton width="60%" />
              <Skeleton />
              <Skeleton width="85%" />
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
