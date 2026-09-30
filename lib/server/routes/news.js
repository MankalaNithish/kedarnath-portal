/**
 * News endpoints under /api/v1/news.
 *
 * Viewers read published articles only — the server filters `published: true`
 * for every request without a valid admin session, and drafts 404 on the detail
 * route. Admin writes require the session cookie. Cover images follow the same
 * Buffer subdocument pattern as models/post.js and models/galleryItem.js.
 */
const express = require('express');
const NewsArticle = require('../../../models/newsArticle');
const { requireAdmin, isAdminReq, getAdminUserId } = require('../auth');
const { parseImageFile } = require('./imageUpload');

const router = express.Router();

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

/* ------------------------------ helpers ------------------------------ */

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining marks
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'news';
}

/** Finds a free slug, appending -2, -3, … when the base slug is taken. */
async function uniqueSlug(base) {
  let candidate = base;
  for (let i = 2; i <= 200; i += 1) {
    const clash = await NewsArticle.findOne({ slug: candidate }).select('_id').lean();
    if (!clash) return candidate;
    candidate = `${base}-${i}`;
  }
  return `${base}-${Date.now()}`;
}

/** Public/admin shape of an article — never includes the cover binary. */
function toListItem(doc, { isAdmin = false } = {}) {
  return {
    id: doc._id,
    title: doc.title,
    slug: doc.slug,
    summary: doc.summary,
    category: doc.category,
    published: doc.published,
    publishedAt: doc.publishedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    hasCover: Boolean(doc.coverImage && doc.coverImage.contentType),
    coverUrl: doc.coverImage && doc.coverImage.data ? `/api/v1/news/${doc._id}/cover` : null,
    // Draft slugs are not publicly addressable; hide them from non-admins.
    href: doc.published || isAdmin ? `/news/${doc.slug}` : null,
  };
}

function parseLimitSkip(query) {
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT));
  const skip = Math.max(0, parseInt(query.skip, 10) || 0);
  return { limit, skip };
}

/* ------------------------------ reads ------------------------------ */

router.get('/', async (req, res) => {
  try {
    const isAdmin = isAdminReq(req);
    const { limit, skip } = parseLimitSkip(req.query);
    const filter = {};
    // Viewers only ever see published articles; admins opt into drafts with ?includeDrafts=1.
    if (!isAdmin || req.query.includeDrafts !== '1') filter.published = true;
    if (req.query.category) filter.category = String(req.query.category);
    if (req.query.q) {
      const q = String(req.query.q);
      filter.$or = [
        { title: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
        { summary: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } },
      ];
    }

    const [docs, total, categories] = await Promise.all([
      NewsArticle.find(filter)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-coverImage.data -content')
        .lean(),
      NewsArticle.countDocuments(filter),
      NewsArticle.distinct('category'),
    ]);

    return res.json({
      articles: docs.map(d => toListItem(d, { isAdmin })),
      total,
      categories: categories.filter(Boolean).sort((a, b) => a.localeCompare(b)),
    });
  } catch (err) {
    console.error('[news] list failed:', err.message);
    return res.status(500).json({ error: 'Could not load the news feed.' });
  }
});

router.get('/:idOrSlug', async (req, res) => {
  try {
    const param = String(req.params.idOrSlug);
    const isObjectId = /^[0-9a-f]{24}$/i.test(param);
    const doc = await NewsArticle.findOne(isObjectId ? { _id: param } : { slug: param })
      .select('-coverImage.data')
      .lean();
    if (!doc) return res.status(404).json({ error: 'Article not found.' });

    // Drafts 404 for viewers — even when the exact URL is guessed or cached.
    if (!doc.published && !isAdminReq(req)) {
      return res.status(404).json({ error: 'Article not found.' });
    }
    return res.json({ article: toListItem(doc, { isAdmin: isAdminReq(req) }), content: doc.content });
  } catch (err) {
    console.error('[news] detail failed:', err.message);
    return res.status(500).json({ error: 'Could not load the article.' });
  }
});

router.get('/:idOrSlug/cover', async (req, res) => {
  try {
    const param = String(req.params.idOrSlug);
    const isObjectId = /^[0-9a-f]{24}$/i.test(param);
    const doc = await NewsArticle.findOne(isObjectId ? { _id: param } : { slug: param })
      .select('coverImage published')
      .lean();
    const allowed = doc && doc.coverImage && doc.coverImage.data && (doc.published || isAdminReq(req));
    if (!allowed) return res.status(404).json({ error: 'Cover not found.' });

    const data = Buffer.from(doc.coverImage.data.buffer ? doc.coverImage.data.buffer : doc.coverImage.data);
    res.setHeader('Content-Type', doc.coverImage.contentType || 'application/octet-stream');
    res.setHeader('Content-Length', data.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.send(data);
  } catch (err) {
    return res.status(404).json({ error: 'Cover not found.' });
  }
});

/* ------------------------------ writes (admin) ------------------------------ */

router.post('/', requireAdmin, async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    const content = String(req.body.content || '').trim();
    if (!title) return res.status(400).json({ error: 'A title is required.' });
    if (!content) return res.status(400).json({ error: 'Article content is required.' });

    // Cover is optional; when present it must be a valid image.
    if (req.file) {
      const check = parseImageFile(req.file);
      if (!check.ok) return res.status(400).json({ error: `Cover image: ${check.error}` });
    }

    const slug = await uniqueSlug(slugify(req.body.slug || title));
    const published = req.body.published === 'true' || req.body.published === true;
    const doc = await NewsArticle.create({
      title,
      slug,
      summary: String(req.body.summary || '').trim(),
      content,
      category: String(req.body.category || '').trim(),
      published,
      publishedAt: published ? new Date() : undefined,
      coverImage: req.file ? {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        originalName: req.file.originalname,
        size: req.file.size,
      } : undefined,
      createdBy: getAdminUserId() || undefined,
    });
    return res.status(201).json({ article: toListItem(doc.toObject(), { isAdmin: true }) });
  } catch (err) {
    console.error('[news] create failed:', err.message);
    if (err.code === 11000) return res.status(400).json({ error: 'That slug is already in use.' });
    return res.status(500).json({ error: 'Could not create the article. Please try again.' });
  }
});

router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const doc = await NewsArticle.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Article not found.' });

    // Whitelist — no field smuggling through JSON.
    if (req.body.title !== undefined) {
      const title = String(req.body.title).trim();
      if (!title) return res.status(400).json({ error: 'A title is required.' });
      doc.title = title;
    }
    if (req.body.summary !== undefined) doc.summary = String(req.body.summary).trim();
    if (req.body.category !== undefined) doc.category = String(req.body.category).trim();
    if (req.body.content !== undefined) {
      const content = String(req.body.content).trim();
      if (!content) return res.status(400).json({ error: 'Article content is required.' });
      doc.content = content;
    }
    if (req.body.slug !== undefined) {
      const desired = slugify(req.body.slug || doc.title);
      if (desired !== doc.slug) {
        const clash = await NewsArticle.findOne({ slug: desired, _id: { $ne: doc._id } }).lean();
        if (clash) return res.status(400).json({ error: 'That slug is already in use.' });
        doc.slug = desired;
      }
    }
    if (req.body.published !== undefined) {
      const published = req.body.published === 'true' || req.body.published === true;
      if (published && !doc.published) doc.publishedAt = new Date(); // first publish
      doc.published = published;
    }
    if (req.file) {
      const check = parseImageFile(req.file);
      if (!check.ok) return res.status(400).json({ error: `Cover image: ${check.error}` });
      doc.coverImage = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        originalName: req.file.originalname,
        size: req.file.size,
      };
    }

    await doc.save();
    return res.json({ article: toListItem(doc.toObject(), { isAdmin: true }) });
  } catch (err) {
    console.error('[news] update failed:', err.message);
    return res.status(500).json({ error: 'Update failed. Please try again.' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const doc = await NewsArticle.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Article not found.' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('[news] delete failed:', err.message);
    return res.status(500).json({ error: 'Delete failed. Please try again.' });
  }
});

module.exports = { router, slugify, uniqueSlug };


