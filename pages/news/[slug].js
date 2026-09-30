import * as React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Box, Chip, Container, Divider, Stack, Typography } from '@mui/material';
import Layout from '@/components/layout';
import ErrorState from '@/components/ErrorState';
import { PostSkeleton } from '@/components/SkeletonCard';
import NewsCard from '@/components/NewsCard';

/**
 * One published news article, addressed by slug (/news/<slug>). Drafts are
 * invisible here because GET /api/v1/news/:slug 404s them for non-admins —
 * the server is the gate, not this page.
 */

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function NewsArticlePage() {
  const router = useRouter();
  const { slug } = router.query;

  const [article, setArticle] = React.useState(null);
  const [content, setContent] = React.useState('');
  const [notFound, setNotFound] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [related, setRelated] = React.useState([]);

  React.useEffect(() => {
    if (!slug) return undefined;
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(`/api/v1/news/${encodeURIComponent(slug)}`);
        if (res.status === 404) {
          if (!cancelled) setNotFound(true);
          return;
        }
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = await res.json();
        if (cancelled) return;
        setArticle(data.article);
        setContent(data.content || '');

        // Related: other published articles, newest first, excluding this one.
        const rel = await fetch(`/api/v1/news?limit=4`);
        if (rel.ok) {
          const relData = await rel.json();
          if (!cancelled) {
            setRelated((relData.articles || []).filter(a => a.id !== data.article.id).slice(0, 3));
          }
        }
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (notFound) {
    return (
      <Layout>
        <Head>
          <title>Article not found &middot; Kedarnath Annadana Seva Samithi Siddipet</title>
          <meta name="robots" content="noindex" />
        </Head>
        <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
          <ErrorState
            title="That story does not exist"
            description="It may have been unpublished, or the link may be wrong."
            onRetry={() => router.push('/news')}
          />
        </Container>
      </Layout>
    );
  }

  const paragraphs = content ? content.split(/\n{2,}/).map(p => p.trim()).filter(Boolean) : [];

  return (
    <Layout>
      <Head>
        <title>{article ? `${article.title} · Kedarnath Annadana Seva Samithi Siddipet` : 'News · Kedarnath Annadana Seva Samithi Siddipet'}</title>
        {article && article.summary && (
          <meta name="description" content={article.summary} />
        )}
      </Head>

      <Container maxWidth="md" sx={{ py: { xs: 4, md: 7 } }}>
        {isLoading && <PostSkeleton />}

        {!isLoading && article && (
          <article>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              {article.category && <Chip size="small" label={article.category} />}
              {article.publishedAt && (
                <Typography variant="caption" color="text.secondary">
                  {formatDate(article.publishedAt)}
                </Typography>
              )}
            </Stack>

            <Typography variant="h1" component="h1" sx={{ mb: 3 }}>
              {article.title}
            </Typography>

            {article.summary && (
              <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: '62ch', mb: 4 }}>
                {article.summary}
              </Typography>
            )}

            {article.coverUrl && (
              <Box
                component="img"
                src={article.coverUrl}
                alt={article.title}
                sx={{
                  width: '100%', maxHeight: 460, objectFit: 'cover',
                  borderRadius: 3, mb: 4,
                }}
              />
            )}

            <Box sx={{ maxWidth: '68ch' }}>
              {paragraphs.map((paragraph, index) => (
                <Typography
                  key={index}
                  variant="body1"
                  sx={{ mb: 2.5, lineHeight: 1.8, whiteSpace: 'pre-line' }}
                >
                  {paragraph}
                </Typography>
              ))}
            </Box>
          </article>
        )}

        {related.length > 0 && (
          <Box sx={{ mt: 7 }}>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="h4" component="h2" sx={{ mb: 3 }}>More from the camp</Typography>
            <Box
              sx={{
                display: 'grid', gap: { xs: 2, md: 3 },
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              }}
            >
              {related.map(relatedArticle => (
                <NewsCard key={relatedArticle.id} article={relatedArticle} />
              ))}
            </Box>
            <Box sx={{ mt: 4 }}>
              <Link href="/news" passHref legacyBehavior>
                <Typography
                  component="a"
                  variant="body2"
                  sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  &larr; All news
                </Typography>
              </Link>
            </Box>
          </Box>
        )}
      </Container>
    </Layout>
  );
}
