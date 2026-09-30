/**
 * URL-slug helper shared by the admin news editor. Mirrors the server's
 * slugify (lib/server/routes/news.js): lowercase, ASCII alphanumerics and
 * dashes only, collapsed, trimmed to 80 chars.
 */
export function slugify(text) {
    return String(text)
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
}
