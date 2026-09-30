import * as React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  Box, Button, Card, Chip, Container, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, LinearProgress, Stack, Tab, Tabs, TextField,
  Typography, FormControlLabel, Switch,
} from '@mui/material';
import AddAPhotoOutlined from '@mui/icons-material/AddAPhotoOutlined';
import ArchiveOutlined from '@mui/icons-material/ArchiveOutlined';
import CloudUploadOutlined from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import ImageOutlined from '@mui/icons-material/ImageOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import PostAddOutlined from '@mui/icons-material/PostAddOutlined';
import UnarchiveOutlined from '@mui/icons-material/UnarchiveOutlined';
import Layout from '@/components/layout';
import EmptyState from '@/components/EmptyState';
import Toast from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import { AdminRowSkeleton, GallerySkeleton } from '@/components/SkeletonCard';
import useAdminSession from '@/lib/client/useAdminSession';
import apiFetch from '@/lib/client/api';
import { compressImage } from '@/lib/client/imageCompress';
import { slugify } from '@/lib/client/slug';

/**
 * Admin portal for the Gallery and News collections. Visible only with a
 * valid server session (HttpOnly cookie via /api/v1/auth/session); every
 * button here calls an API that re-checks that session server-side, so the
 * real gate is the backend, not this page.
 */

const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp';

function formatBytes(size) {
  if (!size && size !== 0) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
}

export default function AdminPortal() {
  const { checking, isAdmin } = useAdminSession();

  const [tab, setTab] = React.useState(0);

  // Gallery state
  const [gallery, setGallery] = React.useState({ items: [], categories: [], total: 0 });
  const [galleryLoading, setGalleryLoading] = React.useState(true);
  const [galleryFailed, setGalleryFailed] = React.useState(false);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState(null);
  const [deleteItem, setDeleteItem] = React.useState(null);
  const [deleteBusy, setDeleteBusy] = React.useState(false);

  // News state
  const [news, setNews] = React.useState({ articles: [], categories: [], total: 0 });
  const [newsLoading, setNewsLoading] = React.useState(true);
  const [newsFailed, setNewsFailed] = React.useState(false);
  const [newsDialog, setNewsDialog] = React.useState(null); // 'new' | article object
  const [newsSaving, setNewsSaving] = React.useState(false);
  const [deleteArticle, setDeleteArticle] = React.useState(null);

  const [toast, setToast] = React.useState({ open: false, message: '', severity: 'success' });
  const showToast = (message, severity = 'success') => setToast({ open: true, message, severity });

  const loadGallery = React.useCallback(async () => {
    setGalleryLoading(true);
    setGalleryFailed(false);
    try {
      const data = await apiFetch('/api/v1/gallery');
      setGallery({ items: data.items || [], categories: data.categories || [], total: data.total || 0 });
    } catch {
      setGalleryFailed(true);
    } finally {
      setGalleryLoading(false);
    }
  }, []);

  const loadNews = React.useCallback(async () => {
    setNewsLoading(true);
    setNewsFailed(false);
    try {
      const data = await apiFetch('/api/v1/news?includeDrafts=1&limit=50');
      setNews({ articles: data.articles || [], categories: data.categories || [], total: data.total || 0 });
    } catch {
      setNewsFailed(false);
      setNewsFailed(true);
    } finally {
      setNewsLoading(false);
    }
  }, []);

  // Load both collections once we know the visitor is an admin.
  React.useEffect(() => {
    if (!isAdmin) return;
    loadGallery();
    loadNews();
  }, [isAdmin, loadGallery, loadNews]);

  // A 401 from any admin API call means the session expired mid-work.
  const handleApiError = React.useCallback((error, fallbackMessage) => {
    showToast(error.status === 401 ? 'Your session expired — log in again to continue.' : (error.message || fallbackMessage), 'error');
  }, []);

    if (checking) {
    return (
      <Layout>
        <Head><title>Admin &middot; Kedarnath Annadana Seva Samithi Siddipet</title></Head>
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
          <AdminRowSkeleton rows={4} />
        </Container>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <Head>
          <title>Admin &middot; Kedarnath Annadana Seva Samithi Siddipet</title>
          <meta name="robots" content="noindex" />
        </Head>
        <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
          <EmptyState
            icon={<LockOutlined />}
            title="Not authorized"
            description="Sign in as a samithi member to manage the gallery and news. This portal checks your session on the server, not in the browser."
            action={(
              <Button component={Link} href="/login" variant="contained">Go to login</Button>
            )}
          />
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Admin &middot; Kedarnath Annadana Seva Samithi Siddipet</title>
        <meta name="robots" content="noindex" />
      </Head>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Stack
          direction="row"
          alignItems="baseline"
          justifyContent="space-between"
          sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}
        >
          <Typography variant="h1" component="h1">Admin portal</Typography>
          <Typography variant="caption">
            {gallery.total} photos &middot; {news.total} articles
          </Typography>
        </Stack>

        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }} aria-label="Manage collections">
          <Tab label="Gallery" />
          <Tab label="News" />
        </Tabs>

        {tab === 0 && (
          <GalleryTab
            gallery={gallery}
            loading={galleryLoading}
            failed={galleryFailed}
            onRetry={loadGallery}
            uploadOpen={uploadOpen}
            setUploadOpen={setUploadOpen}
            editItem={editItem}
            setEditItem={setEditItem}
            deleteItem={deleteItem}
            setDeleteItem={setDeleteItem}
            deleteBusy={deleteBusy}
            setDeleteBusy={setDeleteBusy}
            reload={loadGallery}
            showToast={showToast}
            onError={handleApiError}
          />
        )}

        {tab === 1 && (
          <NewsTab
            news={news}
            loading={newsLoading}
            failed={newsFailed}
            onRetry={loadNews}
            dialog={newsDialog}
            setDialog={setNewsDialog}
            saving={newsSaving}
            setSaving={setNewsSaving}
            deleteArticle={deleteArticle}
            setDeleteArticle={setDeleteArticle}
            reload={loadNews}
            showToast={showToast}
            onError={handleApiError}
          />
        )}
      </Container>

      <Toast toast={toast} onClose={() => setToast(t => ({ ...t, open: false }))} />
    </Layout>
  );
}

function GalleryTab({
  gallery, loading, failed, onRetry,
  uploadOpen, setUploadOpen, editItem, setEditItem,
  deleteItem, setDeleteItem, deleteBusy, setDeleteBusy,
  reload, showToast, onError,
}) {
  const [pending, setPending] = React.useState([]);      // Files queued for upload
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState({ done: 0, total: 0 });
  const [current, setCurrent] = React.useState(null);    // currently uploading name
  const [form, setForm] = React.useState({ title: '', category: '', caption: '', description: '', displayOrder: 0 });

  const openUpload = () => {
    setForm({ title: '', category: '', caption: '', description: '', displayOrder: 0 });
    setPending([]);
    setUploadOpen(true);
  };

  const chooseFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    const prepared = [];
    for (const file of files) {
      try {
        prepared.push({ original: file, compressed: await compressImage(file) });
      } catch (err) {
        showToast(`${file.name}: ${err.message}`, 'error');
      }
    }
    setPending(prev => [...prev, ...prepared]);
  };

  const removePending = (index) => {
    setPending(prev => prev.filter((_, i) => i !== index));
  };

  const submitUpload = async () => {
    if (!form.title.trim()) {
      showToast('Give the batch a title first — e.g. “Langar service, June 2026”.', 'error');
      return;
    }
    if (!pending.length) {
      showToast('Choose at least one photograph.', 'error');
      return;
    }
    setUploading(true);
    setProgress({ done: 0, total: pending.length });
    try {
      for (let i = 0; i < pending.length; i += 1) {
        setCurrent(pending[i].compressed.name);
        const body = new FormData();
        body.append('images', pending[i].compressed);
        body.append('title', form.title);
        body.append('category', form.category);
        body.append('caption', form.caption);
        body.append('description', form.description);
        body.append('displayOrder', String(form.displayOrder || 0));
        await apiFetch('/api/v1/gallery', { method: 'POST', body });
        setProgress(p => ({ ...p, done: p.done + 1 }));
      }
      showToast(`Uploaded ${pending.length} photograph${pending.length > 1 ? 's' : ''}.`);
      setUploadOpen(false);
      reload();
    } catch (error) {
      onError(error, 'Upload failed.');
    } finally {
      setUploading(false);
      setCurrent(null);
    }
  };

  const submitEdit = async () => {
    try {
      await apiFetch(`/api/v1/gallery/${editItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editItem),
      });
      showToast('Photograph details updated.');
      setEditItem(null);
      reload();
    } catch (error) {
      onError(error, 'Update failed.');
    }
  };

  const submitDelete = async () => {
    setDeleteBusy(true);
    try {
      await apiFetch(`/api/v1/gallery/${deleteItem.id}`, { method: 'DELETE' });
      showToast('Photograph deleted.');
      setDeleteItem(null);
      reload();
    } catch (error) {
      onError(error, 'Delete failed.');
      setDeleteItem(null);
    } finally {
      setDeleteBusy(false);
    }
  };

  const header = (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
      <Typography variant="h4" component="h2">
        Camp photographs <Typography component="span" variant="caption">({gallery.total})</Typography>
      </Typography>
      <Button variant="contained" startIcon={<AddAPhotoOutlined />} onClick={openUpload}>
        Upload photos
      </Button>
    </Stack>
  );

  if (loading) {
    return <Box>{header}<GallerySkeleton count={8} /></Box>;
  }

  if (failed) {
    return (
      <Box>
        {header}
        <EmptyState title="The gallery did not load" description="Check that the Node server is running, then try again." onRetry={onRetry} />
      </Box>
    );
  }

  if (gallery.items.length === 0) {
    return (
      <Box>
        {header}
        <EmptyState
          icon={<ImageOutlined />}
          title="No photographs yet"
          description="Upload the first batch — every image is compressed in your browser before it is stored, so a full camp album fits in the free database tier."
          action={(
            <Button variant="contained" startIcon={<AddAPhotoOutlined />} onClick={openUpload}>
              Upload photos
            </Button>
          )}
        />
      </Box>
    );
  }

  return (
    <Box>
      {header}
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' } }}>
        {gallery.items.map(item => (
          <Card key={item.id} sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ position: 'relative', aspectRatio: '1 / 1', bgcolor: 'action.hover' }}>
              <img
                src={item.imageUrl}
                alt={item.caption || item.title || 'Camp photograph'}
                loading="lazy"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
            <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.title}</Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                {item.category && <Chip size="small" label={item.category} />}
                <Typography variant="caption" color="text.secondary">{formatBytes(item.image && item.image.size)}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 'auto', pt: 1 }}>
                <IconButton size="small" aria-label={`Edit ${item.title}`} onClick={() => setEditItem(item)}>
                  <EditOutlined fontSize="small" />
                </IconButton>
                <IconButton size="small" aria-label={`Delete ${item.title}`} color="error" onClick={() => setDeleteItem(item)}>
                  <DeleteOutlineOutlined fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
          </Card>
        ))}
      </Box>

      {/* Upload dialog */}
      <Dialog open={uploadOpen} onClose={() => !uploading && setUploadOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Upload photographs</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Batch title (required)"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
            <TextField
              label="Collection"
              placeholder="e.g. Langar, Yatra, Volunteers"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            />
            <TextField
              label="Caption"
              value={form.caption}
              onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
            />
            <TextField
              label="Description"
              multiline
              minRows={2}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <TextField
              label="Display order"
              type="number"
              value={form.displayOrder}
              onChange={e => setForm(f => ({ ...f, displayOrder: e.target.value }))}
              helperText="Lower numbers appear first in the gallery."
            />
            <Box>
              <Button variant="outlined" component="label" startIcon={<CloudUploadOutlined />}>
                Choose images (JPG/PNG/WebP)
                <input type="file" hidden multiple accept={ACCEPTED_IMAGE_TYPES} onChange={chooseFiles} />
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Images are resized to 1920 px and compressed in your browser before upload.
              </Typography>
            </Box>
            {pending.map((p, index) => (
              <Stack key={index} direction="row" spacing={1} alignItems="center">
                <Chip
                  size="small"
                  label={`${p.compressed.name} · ${formatBytes(p.compressed.size)}`}
                  onDelete={() => removePending(index)}
                />
              </Stack>
            ))}

            {uploading && (
              <Box>
                {current && (
                  <Typography variant="caption">
                    {`Uploading ${current} (${Math.min(progress.done + 1, progress.total)} of ${progress.total})…`}
                  </Typography>
                )}
                <LinearProgress
                  variant="determinate"
                  value={progress.total ? Math.round((progress.done / progress.total) * 100) : 0}
                  sx={{ mt: 1 }}
                />
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setUploadOpen(false)} disabled={uploading}>Cancel</Button>
          <Button onClick={submitUpload} variant="contained" disabled={uploading}>
            {uploading ? 'Uploading…' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={Boolean(editItem)} onClose={() => setEditItem(null)} fullWidth maxWidth="sm">
        <DialogTitle>Edit photograph</DialogTitle>
        <DialogContent>
          {editItem && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Title"
                value={editItem.title}
                onChange={e => setEditItem(item => ({ ...item, title: e.target.value }))}
              />
              <TextField
                label="Collection"
                value={editItem.category}
                onChange={e => setEditItem(item => ({ ...item, category: e.target.value }))}
              />
              <TextField
                label="Caption"
                value={editItem.caption}
                onChange={e => setEditItem(item => ({ ...item, caption: e.target.value }))}
              />
              <TextField
                label="Description"
                multiline
                minRows={2}
                value={editItem.description}
                onChange={e => setEditItem(item => ({ ...item, description: e.target.value }))}
              />
              <TextField
                label="Display order"
                type="number"
                value={editItem.displayOrder}
                onChange={e => setEditItem(item => ({ ...item, displayOrder: e.target.value }))}
              />
              <Typography variant="caption" color="text.secondary">
                To replace the image itself, delete the photograph and upload a new one — stored images are immutable.
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setEditItem(null)}>Cancel</Button>
          <Button onClick={submitEdit} variant="contained">Save changes</Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={Boolean(deleteItem)}
        title="Delete this photograph?"
        message={deleteItem ? `“${deleteItem.title}” will be removed from the public gallery. This cannot be undone.` : ''}
        busy={deleteBusy}
        onConfirm={submitDelete}
        onClose={() => setDeleteItem(null)}
      />
    </Box>
  );
}

function NewsTab({
  news, loading, failed, onRetry,
  dialog, setDialog, saving, setSaving,
  deleteArticle, setDeleteArticle,
  reload, showToast, onError,
}) {
  const emptyDraft = () => ({
    title: '', slug: '', category: '', summary: '', content: '',
    published: false, cover: null,
  });
  const [draft, setDraft] = React.useState(null);
  const [slugEdited, setSlugEdited] = React.useState(false);
  const [coverPreview, setCoverPreview] = React.useState(null);

  const startNew = () => {
    setDraft(emptyDraft());
    setSlugEdited(false);
    setDialog('new');
  };

  const startEdit = (article) => {
    setDraft({ ...article, cover: null });
    setSlugEdited(true); // existing article: don't re-slug from title edits
    setDialog(article);
  };

  const onTitleChange = (value) => {
    setDraft(d => ({
      ...d,
      title: value,
      slug: slugEdited ? d.slug : slugify(value),
    }));
  };

  const onSlugChange = (value) => {
    setSlugEdited(true);
    setDraft(d => ({ ...d, slug: value }));
  };

  const pickCover = async (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setDraft(d => ({ ...d, cover: compressed }));
      setCoverPreview(URL.createObjectURL(compressed));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const save = async () => {
    if (!draft.title.trim() || !draft.content.trim()) {
      showToast('Title and content are required.', 'error');
      return;
    }
    setSaving(true);
    const isNew = dialog === 'new';
    const payload = new FormData();
    payload.append('title', draft.title);
    payload.append('slug', draft.slug);
    payload.append('category', draft.category || '');
    payload.append('summary', draft.summary || '');
    payload.append('content', draft.content);
    payload.append('published', String(Boolean(draft.published)));
    if (draft.cover) payload.append('cover', draft.cover);

    try {
      if (isNew) {
        await apiFetch('/api/v1/news', { method: 'POST', body: payload });
        showToast(draft.published ? 'Article published.' : 'Draft saved.');
      } else {
        await apiFetch(`/api/v1/news/${draft.id}`, { method: 'PATCH', body: payload });
        showToast('Article updated.');
      }
      setDialog(null);
      setDraft(null);
      reload();
    } catch (error) {
      onError(error, 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (article) => {
    try {
      await apiFetch(`/api/v1/news/${article.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !article.published }),
      });
      showToast(article.published ? 'Moved back to drafts.' : 'Article published.');
      reload();
    } catch (error) {
      onError(error, 'Could not update publish state.');
    }
  };

  const submitDelete = async () => {
    try {
      await apiFetch(`/api/v1/news/${deleteArticle.id}`, { method: 'DELETE' });
      showToast('Article deleted.');
      setDeleteArticle(null);
      reload();
    } catch (error) {
      onError(error, 'Delete failed.');
      setDeleteArticle(null);
    }
  };

  const listHeader = (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
      <Typography variant="h4" component="h2">
        Camp updates <Typography component="span" variant="caption">({news.total})</Typography>
      </Typography>
      <Button variant="contained" startIcon={<PostAddOutlined />} onClick={startNew}>
        Write article
      </Button>
    </Stack>
  );

  if (loading) {
    return <Box>{listHeader}<AdminRowSkeleton rows={5} /></Box>;
  }

  if (failed) {
    return (
      <Box>
        {listHeader}
        <EmptyState title="News did not load" description="Check that the Node server is running, then try again." onRetry={onRetry} />
      </Box>
    );
  }

  if (news.articles.length === 0) {
    return (
      <Box>
        {listHeader}
        <EmptyState
          icon={<PostAddOutlined />}
          title="No news yet"
          description="Write the first update — save it as a draft to prepare it privately, then publish with one tap."
          action={(
            <Button variant="contained" startIcon={<PostAddOutlined />} onClick={startNew}>
              Write article
            </Button>
          )}
        />
      </Box>
    );
  }

  return (
    <Box>
      {listHeader}
      <Stack spacing={2}>
        {news.articles.map(article => (
          <Card key={article.id} sx={{ display: 'flex', alignItems: 'center', p: 1.5, gap: 2 }}>
            {article.coverUrl ? (
              <Box
                component="img"
                src={article.coverUrl}
                alt=""
                sx={{ width: 72, height: 72, borderRadius: 1.5, objectFit: 'cover', flexShrink: 0 }}
              />
            ) : (
              <Box
                sx={{
                  width: 72, height: 72, borderRadius: 1.5, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover',
                }}
              >
                <PostAddOutlined color="action" />
              </Box>
            )}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 600 }} noWrap>{article.title}</Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                {article.published
                  ? <Chip size="small" color="success" label={`Published · ${formatDate(article.publishedAt)}`} />
                  : <Chip size="small" label="Draft" />}
                {article.category && <Chip size="small" label={article.category} />}
                {article.published && (
                  <Typography variant="caption" color="text.secondary" component="span">
                    /news/{article.slug}
                  </Typography>
                )}
              </Stack>
            </Box>
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
              <IconButton
                size="small"
                aria-label={article.published ? `Unpublish ${article.title}` : `Publish ${article.title}`}
                onClick={() => togglePublish(article)}
              >
                {article.published ? <ArchiveOutlined fontSize="small" /> : <UnarchiveOutlined fontSize="small" />}
                </IconButton>
              <IconButton size="small" aria-label={`Edit ${article.title}`} onClick={() => startEdit(article)}>
                <EditOutlined fontSize="small" />
              </IconButton>
              <IconButton size="small" aria-label={`Delete ${article.title}`} color="error" onClick={() => setDeleteArticle(article)}>
                <DeleteOutlineOutlined fontSize="small" />
              </IconButton>
            </Stack>
          </Card>
        ))}
      </Stack>

      {/* Create/edit article dialog */}
      <Dialog open={Boolean(dialog)} onClose={() => !saving && setDialog(null)} fullWidth maxWidth="md">
        <DialogTitle>{dialog === 'new' ? 'Write an article' : 'Edit article'}</DialogTitle>
        <DialogContent>
          {draft && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Title (required)"
                value={draft.title}
                onChange={e => onTitleChange(e.target.value)}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Link (slug)"
                  value={draft.slug}
                  onChange={e => onSlugChange(e.target.value)}
                  helperText={draft.slug ? `/news/${draft.slug}` : 'Generated from the title'}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Topic"
                  placeholder="e.g. Camp update, Yatra, Seva story"
                  value={draft.category}
                  onChange={e => setDraft(d => ({ ...d, category: e.target.value }))}
                  sx={{ flex: 1 }}
                />
              </Stack>
              <TextField
                label="Summary"
                multiline
                minRows={2}
                value={draft.summary}
                onChange={e => setDraft(d => ({ ...d, summary: e.target.value }))}
                helperText="Shown on cards; leave blank to reuse the first lines of the article."
              />
              <TextField
                label="Article content (required)"
                multiline
                minRows={10}
                value={draft.content}
                onChange={e => setDraft(d => ({ ...d, content: e.target.value }))}
                helperText="Separate paragraphs with a blank line."
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                <Button variant="outlined" component="label" startIcon={<CloudUploadOutlined />}>
                  {draft.cover ? 'Change cover image' : 'Add cover image'}
                  <input type="file" hidden accept={ACCEPTED_IMAGE_TYPES} onChange={pickCover} />
                </Button>
                {coverPreview && (
                  <Box
                    component="img"
                    src={coverPreview}
                    alt="Cover preview"
                    sx={{ height: 56, borderRadius: 1, border: theme => `1px solid ${theme.palette.divider}` }}
                  />
                )}
                {!draft.cover && !coverPreview && (
                  <Typography variant="caption" color="text.secondary">
                    Optional — compressed in your browser before upload.
                  </Typography>
                )}
              </Stack>
              <FormControlLabel
                control={(
                  <Switch
                    checked={Boolean(draft.published)}
                    onChange={e => setDraft(d => ({ ...d, published: e.target.checked }))}
                  />
                )}
                label={draft.published ? 'Published — visible on /news' : 'Draft — only admins can see it'}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialog(null)} disabled={saving}>Cancel</Button>
          <Button onClick={save} variant="contained" disabled={saving}>
            {saving ? 'Saving…' : (draft && draft.published ? 'Publish' : 'Save draft')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={Boolean(deleteArticle)}
        title="Delete this article?"
        message={deleteArticle ? `“${deleteArticle.title}” will be removed permanently${deleteArticle.published ? ' — its public link will stop working' : ''}. This cannot be undone.` : ''}
        busy={saving}
        onConfirm={submitDelete}
        onClose={() => setDeleteArticle(null)}
      />
    </Box>
  );
}



