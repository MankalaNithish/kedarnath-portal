import * as React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import {
  Box, Button, Chip, Container, Stack, Typography,
} from '@mui/material';
import AddPhotoAlternateOutlined from '@mui/icons-material/AddPhotoAlternateOutlined';
import Layout from '@/components/layout';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import { GallerySkeleton } from '@/components/SkeletonCard';
import GalleryLightbox from '@/components/GalleryLightbox';
import { useAnimation, fadeInUp, useStagger } from '@/components/motion';

/**
 * Public photo gallery — every photograph the camp has uploaded through
 * /admin. Read-only for viewers; images stream from GET /api/v1/gallery/:id/image
 * with immutable cache headers, so repeat visits are instant.
 */

export default function Gallery() {
  const [items, setItems] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [category, setCategory] = React.useState('');
  const [total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadFailed, setLoadFailed] = React.useState(false);
  const [lightboxIndex, setLightboxIndex] = React.useState(null);

  const item = useAnimation(fadeInUp);
  const group = useStagger(0.03);

  const load = React.useCallback(async (selectedCategory) => {
    setIsLoading(true);
    setLoadFailed(false);
    try {
      const qs = new URLSearchParams();
      if (selectedCategory) qs.set('category', selectedCategory);
      const res = await fetch(`/api/v1/gallery${qs.toString() ? `?${qs}` : ''}`);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      setItems(data.items || []);
      setCategories(data.categories || []);
      setTotal(data.total || 0);
    } catch {
      setLoadFailed(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => { load(category); }, [load, category]);

  const filtered = items;

  return (
    <Layout>
      <Head>
        <title>Gallery &middot; Kedarnath Annadana Seva Samithi Siddipet</title>
        <meta
          name="description"
          content="Photographs from the free-food camp at Kedarnath — the langar, the yatra, and the volunteers."
        />
      </Head>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        <Stack
          direction="row"
          alignItems="baseline"
          justifyContent="space-between"
          sx={{ mb: 1.5, flexWrap: 'wrap', gap: 1 }}
        >
          <Typography variant="h1" component="h1">Gallery</Typography>
          {!isLoading && !loadFailed && (
            <Typography variant="caption">{total} photographs</Typography>
          )}
        </Stack>
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: '62ch', mb: 3 }}>
          Scenes from the annadanam camp on the Kedarnath yatra — hot meals at 3,583 m,
          the volunteers who cook them, and the pilgrims who share them.
        </Typography>

        {isLoading && <GallerySkeleton />}

        {!isLoading && loadFailed && (
          <ErrorState
            title="The gallery did not load"
            description="The camp's photo service is not responding right now."
            onRetry={() => load(category)}
          />
        )}

        {!isLoading && !loadFailed && filtered.length === 0 && (
          <EmptyState
            icon={<AddPhotoAlternateOutlined />}
            title={category ? 'No photographs in this collection yet' : 'The gallery is being prepared'}
            description={
              category
                ? 'Try another collection — new photographs are added from the camp as they arrive.'
                : 'Photographs from the camp will appear here. Members upload them from the admin portal.'
            }
            action={category && (
              <Button variant="outlined" onClick={() => setCategory('')}>Show everything</Button>
            )}
          />
        )}

        {!isLoading && !loadFailed && filtered.length > 0 && (
          <Box
            component="section"
            aria-label="Gallery photographs"
            sx={{ mb: 4 }}
          >
            {categories.length > 0 && (
              <Stack
                direction="row"
                spacing={1}
                sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}
                role="group"
                aria-label="Filter by collection"
              >
                <Chip
                  label="All"
                  clickable
                  color={category === '' ? 'primary' : 'default'}
                  onClick={() => setCategory('')}
                />
                {categories.map(name => (
                  <Chip
                    key={name}
                    label={name}
                    clickable
                    color={category === name ? 'primary' : 'default'}
                    onClick={() => setCategory(name)}
                  />
                ))}
              </Stack>
            )}

            <motion.div
              variants={group}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-60px' }}
            >
              <Box
                sx={{
                  display: 'grid', gap: { xs: 1, sm: 1.5 },
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
                }}
              >
                {filtered.map((tile, i) => (
                  <motion.div key={tile.id} variants={item}>
                    <Box
                      component="button"
                      onClick={() => setLightboxIndex(i)}
                      aria-label={
                        tile.caption || tile.title
                          ? `Open photograph: ${tile.caption || tile.title}`
                          : `Open photograph ${i + 1} of ${filtered.length}`
                      }
                      sx={{
                        display: 'block', width: '100%', p: 0, border: 0, cursor: 'pointer',
                        position: 'relative', aspectRatio: '1 / 1', overflow: 'hidden',
                        borderRadius: 2, background: 'transparent',
                        outline: theme => `1px solid ${theme.palette.divider}`,
                        '& img': { transition: 'transform .4s cubic-bezier(.22,1,.36,1)' },
                        '&:hover img': { transform: 'scale(1.05)' },
                      }}
                    >
                      <img
                        src={tile.imageUrl}
                        alt={tile.caption || tile.title || 'Kedarnath annadanam camp photograph'}
                        loading="lazy"
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          </Box>
        )}
      </Container>

      <GalleryLightbox
        items={filtered}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChangeIndex={setLightboxIndex}
      />
    </Layout>
  );
}
