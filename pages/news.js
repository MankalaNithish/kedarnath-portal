import * as React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import {
  Box, Button, Chip, Container, InputAdornment, Stack, TextField, Typography,
} from '@mui/material';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import NewspaperOutlined from '@mui/icons-material/NewspaperOutlined';
import Layout from '@/components/layout';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import { NewsSkeleton } from '@/components/SkeletonCard';
import NewsCard from '@/components/NewsCard';
import { useAnimation, fadeInUp, useStagger } from '@/components/motion';

/**
 * Public news feed — stories and camp updates the samithi has published
 * through /admin. Read-only for viewers; only published articles exist at
 * this layer because the API filters drafts server-side.
 */

export default function News() {
  const [articles, setArticles] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [category, setCategory] = React.useState('');
  const [query, setQuery] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  const [total, setTotal] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadFailed, setLoadFailed] = React.useState(false);

  const item = useAnimation(fadeInUp);
  const group = useStagger(0.05);

  const load = React.useCallback(async (selectedCategory, searchQuery) => {
    setIsLoading(true);
    setLoadFailed(false);
    try {
      const qs = new URLSearchParams();
      if (selectedCategory) qs.set('category', selectedCategory);
      if (searchQuery) qs.set('q', searchQuery);
      const res = await fetch(`/api/v1/news${qs.toString() ? `?${qs}` : ''}`);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const data = await res.json();
      setArticles(data.articles || []);
      setCategories(data.categories || []);
      setTotal(data.total || 0);
    } catch {
      setLoadFailed(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => { load(category, debouncedQuery); }, [load, category, debouncedQuery]);

  // Debounce the search box so typing does not hammer the API.
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  const [featured, ...rest] = articles;

  return (
    <Layout>
      <Head>
        <title>News &middot; Kedarnath Annadana Seva Samithi Siddipet</title>
        <meta
          name="description"
          content="News and camp updates from the Kedarnath annadanam seva — servings, weather, yatra conditions and seva stories."
        />
      </Head>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        <Typography variant="h1" component="h1">News</Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: '62ch', mt: 1.5 }}>
          Updates from the camp — how many plates were served, how the yatra is
          flowing, and what the volunteers are seeing at 3,583 m.
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ my: 3 }}
        >
          <TextField
            size="small"
            placeholder="Search news…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 320 }}
          />
          {categories.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }} role="group" aria-label="Filter by topic">
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
        </Stack>

        {isLoading && <NewsSkeleton count={6} />}

        {!isLoading && loadFailed && (
          <ErrorState
            title="News did not load"
            description="The camp's news service is not responding right now."
            onRetry={() => load(category, debouncedQuery)}
          />
        )}

        {!isLoading && !loadFailed && articles.length === 0 && (
          <EmptyState
            icon={<NewspaperOutlined />}
            title={category || query ? 'Nothing matches that filter yet' : 'No news yet'}
            description={
              (category || query)
                ? 'Try a different topic or clear the search — updates are posted as things happen at the camp.'
                : 'When the samithi publishes its first update, it will appear here.'
            }
            action={(category || query) && (
              <Button
                variant="outlined"
                onClick={() => { setCategory(''); setQuery(''); }}
              >
                Clear filters
              </Button>
            )}
          />
        )}

        {!isLoading && !loadFailed && articles.length > 0 && (
          <Box component="section" aria-label="News articles">
            {featured && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="overline" color="text.secondary">Latest</Typography>
                <NewsCard article={featured} featured />
              </Box>
            )}
            {rest.length > 0 && (
              <motion.div
                variants={group}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-60px' }}
              >
                <Box
                  sx={{
                    display: 'grid', gap: { xs: 2, md: 3 },
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                  }}
                >
                  {rest.map(article => (
                    <motion.div key={article.id} variants={item}>
                      <NewsCard article={article} />
                    </motion.div>
                  ))}
                </Box>
              </motion.div>
            )}
            {rest.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This is the most recent update — more will appear as the camp posts them.
              </Typography>
            )}
          </Box>
        )}
      </Container>
    </Layout>
  );
}
