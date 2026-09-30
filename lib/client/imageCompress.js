/**
 * Client-side image compression (canvas API — zero new dependencies).
 * Longest edge is capped at MAX_EDGE and the file is re-encoded as JPEG
 * (quality 0.8), which keeps typical photos at ~100–300 KB — small enough for
 * the MongoDB Atlas M0 free tier. Transparency is flattened onto white.
 * Must run in the browser (uses Image + canvas).
 */
export const MAX_EDGE = 1920;
export const MAX_INPUT_BYTES = 25 * 1024 * 1024; // reject absurd originals early
export const JPEG_QUALITY = 0.8;

export function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Could not read the file.'));
        reader.readAsDataURL(file);
    });
}

function loadImage(dataUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('That file does not look like a valid image.'));
        img.src = dataUrl;
    });
}

/**
 * @param {File} file - an image chosen via <input type="file">
 * @param {number} [maxEdge=MAX_EDGE] - longest allowed side in pixels
 * @returns {Promise<File>} a JPEG File, resized/re-encoded when needed
 */
export async function compressImage(file, maxEdge = MAX_EDGE) {
    if (!file) throw new Error('No file selected.');
    if (file.size > MAX_INPUT_BYTES) throw new Error('That image is too large even before compression (25 MB limit).');

    const dataUrl = await fileToDataUrl(file);
    const img = await loadImage(dataUrl);

    const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Your browser could not process this image.');
    ctx.fillStyle = '#ffffff'; // flatten PNG transparency for JPEG
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error('Compression failed. Try a smaller image.'))),
            'image/jpeg',
            JPEG_QUALITY,
        );
    });

    const baseName = (file.name || 'photo').replace(/\.[^.]+$/, '') || 'photo';
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
}
