/**
 * Shared upload validation for gallery images and news covers.
 * Multer already buffered the files in memory; this module decides whether a
 * buffered file may be stored. Exact numbers are exported so the client can
 * pre-validate identically before an upload even starts.
 */
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB after compression

/**
 * @param {object} file multer file ({ originalname, mimetype, size, buffer })
 * @returns {{ok: boolean, error?: string}}
 */
function parseImageFile(file) {
  if (!file || !file.buffer) return { ok: false, error: 'no file data' };
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return { ok: false, error: 'only JPG, PNG or WebP images are allowed' };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: 'image is larger than 8 MB' };
  }
  // The magic bytes must agree with the declared type — a renamed .txt or
  // .gif fails here rather than landing in the gallery.
  const b = file.buffer;
  const isJpeg = b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  const isPng = b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
  const isWebp = b.length > 12 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP';
  const magicOk = { 'image/jpeg': isJpeg, 'image/png': isPng, 'image/webp': isWebp }[file.mimetype];
  if (!magicOk) return { ok: false, error: 'file content does not look like a valid image' };
  return { ok: true };
}

module.exports = { parseImageFile, ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES };
