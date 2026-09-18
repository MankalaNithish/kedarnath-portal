import { Box, Card, Skeleton } from '@mui/material';

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
