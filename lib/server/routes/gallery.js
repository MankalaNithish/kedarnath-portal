/**
 * Gallery endpoints under /api/v1/gallery.
 *
 * Reads are public; every write requires the admin session cookie (401 otherwise
 * — enforced here, not in the UI). Images ride as MongoDB Buffers, following the
 * existing models/post.js pattern, and are served by the /image route below.
 */
const express = require('express');
const GalleryItem = require('../../../models/galleryItem');
const { requireAdmin, getAdminUserId } = require('../auth');
const { parseImageFile, ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } = require('./imageUpload');

const router = express.Router();

const DEFAULT_LIMIT = 60;
const MAX_LIMIT = 120;

/* ------------------------------ helpers ------------------------------ */

/** Public shape of a gallery item — never includes the binary. */
function toListItem(doc) {
  return {
    id: doc._id,
    title: doc.title,
    caption: doc.caption,
    description: doc.description,
    category: doc.category,
    displayOrder: doc.displayOrder,
    image: {
      contentType: doc.image ? doc.image.contentType : null,
      originalName: doc.image ? doc.image.originalName : null,
      size: doc.image ? doc.image.size : null,
    },
    imageUrl: `/api/v1/gallery/${doc._id}/image`,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function parseLimitSkip(query) {
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT));
  const skip = Math.max(0, parseInt(query.skip, 10) || 0);
  return { limit, skip };
}

/* ------------------------------ reads (public) ------------------------------ */

router.get('/', async (req, res) => {
  try {
    const { limit, skip } = parseLimitSkip(req.query);
    const filter = {};
    if (req.query.category) filter.category = String(req.query.category);

    const [docs, total, categories] = await Promise.all([
      GalleryItem.find(filter)
        .sort({ displayOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-image.data')
        .lean(),
      GalleryItem.countDocuments(filter),
      GalleryItem.distinct('category'),
    ]);

    return res.json({
      items: docs.map(toListItem),
      total,
      categories: categories.filter(Boolean).sort((a, b) => a.localeCompare(b)),
    });
  } catch (err) {
    console.error('[gallery] list failed:', err.message);
    return res.status(500).json({ error: 'Could not load the gallery.' });
  }
});

/**
 * Serves the stored bytes. ObjectId is immutable, so the URL is safe to cache
 * aggressively — replacing an image changes the document id.
 */
router.get('/:id/image', async (req, res) => {
  try {
    const doc = await GalleryItem.findById(req.params.id).select('image').lean();
    if (!doc || !doc.image || !doc.image.data) {
      return res.status(404).json({ error: 'Image not found.' });
    }
    const data = Buffer.from(doc.image.data.buffer ? doc.image.data.buffer : doc.image.data);
    res.setHeader('Content-Type', doc.image.contentType || 'application/octet-stream');
    res.setHeader('Content-Length', data.length);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.send(data);
  } catch (err) {
    // CastError from a malformed id lands here — treat as not found.
    return res.status(404).json({ error: 'Image not found.' });
  }
});

/* ------------------------------ writes (admin) ------------------------------ */

router.post('/', requireAdmin, async (req, res) => {
  try {
    const files = Array.isArray(req.files) ? req.files : [];
    if (!files.length) {
      return res.status(400).json({ error: 'Choose at least one image to upload.' });
    }

    const title = String(req.body.title || '').trim();
    if (!title) {
      return res.status(400).json({ error: 'A title is required.' });
    }
    const category = String(req.body.category || '').trim();
    const displayOrder = Number.isFinite(parseInt(req.body.displayOrder, 10))
      ? parseInt(req.body.displayOrder, 10) : 0;

    const created = [];
    for (const file of files) {
      const check = parseImageFile(file);
      if (!check.ok) {
        return res.status(400).json({ error: `${file.originalName}: ${check.error}` });
      }
      const item = await GalleryItem.create({
        title,
        caption: String(req.body.caption || '').trim(),
        description: String(req.body.description || '').trim(),
        category,
        displayOrder,
        image: {
          data: file.buffer,
          contentType: file.mimetype,
          originalName: file.originalname,
          size: file.size,
        },
        createdBy: getAdminUserId() || undefined,
      });
      created.push(toListItem(item.toObject()));
    }

    return res.status(201).json({ items: created, count: created.length });
  } catch (err) {
    console.error('[gallery] upload failed:', err.message);
    return res.status(500).json({ error: 'Upload failed. Please try again.' });
  }
});

router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const doc = await GalleryItem.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Gallery item not found.' });

    // Whitelist — a client cannot smuggle createdBy or image bytes through JSON.
    const updates = {};
    if (req.body.title !== undefined) {
      const title = String(req.body.title).trim();
      if (!title) return res.status(400).json({ error: 'A title is required.' });
      updates.title = title;
    }
    if (req.body.caption !== undefined) updates.caption = String(req.body.caption).trim();
    if (req.body.description !== undefined) updates.description = String(req.body.description).trim();
    if (req.body.category !== undefined) updates.category = String(req.body.category).trim();
    if (req.body.displayOrder !== undefined) {
      updates.displayOrder = Number.isFinite(parseInt(req.body.displayOrder, 10))
        ? parseInt(req.body.displayOrder, 10) : 0;
    }

    Object.assign(doc, updates);
    await doc.save();
    return res.json({ item: toListItem(doc.toObject()) });
  } catch (err) {
    console.error('[gallery] update failed:', err.message);
    return res.status(500).json({ error: 'Update failed. Please try again.' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const doc = await GalleryItem.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Gallery item not found.' });
    return res.json({ ok: true });
  } catch (err) {
    console.error('[gallery] delete failed:', err.message);
    return res.status(500).json({ error: 'Delete failed. Please try again.' });
  }
});

module.exports = { router, toListItem, parseLimitSkip, DEFAULT_LIMIT, MAX_LIMIT, ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES };


