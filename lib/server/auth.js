/**
 * Server-side admin auth for the Gallery & News management portal.
 *
 * The portal has exactly one admin identity — the member who signs in at
 * /login. Rather than inventing a second authorization system, this module
 * gives that existing single-admin login server-side teeth:
 *
 *   - credentials come from env (ADMIN_USERNAME / ADMIN_PASSWORD) and are
 *     seeded as a scrypt hash into the `users` collection on boot;
 *   - a successful login sets a signed HttpOnly session cookie (HMAC-SHA256);
 *   - `requireAdmin` guards every gallery/news write endpoint.
 *
 * Zero new dependencies — node's crypto module does the hashing and signing.
 */
const crypto = require('crypto');
const { User } = require('../../models');

const COOKIE_NAME = 'kedar_admin';
const SESSION_TTL_SECONDS = 12 * 60 * 60;          // 12 hours
const SCRYPT_KEYLEN = 32;
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };    // OWASP baseline, ~50 ms

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'kedarnathadmin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adminkedar3456';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'kedarnath-portal-dev-secret-change-me';

/** The admin User document, when MongoDB is reachable. */
let adminRecord = null;
/** Cached env-password hash, used when no DB record exists (static deploys). */
let envHashCache = null;
/** Fixed scrypt target so failed logins take the same time as real ones. */
const DUMMY_HASH = hashPassword('timing-equalizer');

/* ---------------- password hashing ---------------- */

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, SCRYPT_KEYLEN, SCRYPT_PARAMS).toString('hex');
  return `scrypt$${SCRYPT_PARAMS.N}$${SCRYPT_PARAMS.r}$${SCRYPT_PARAMS.p}$${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  try {
    const [scheme, n, r, p, salt, hash] = String(stored).split('$');
    if (scheme !== 'scrypt' || !salt || !hash) return false;
    const actual = crypto.scryptSync(String(password), salt, SCRYPT_KEYLEN, { N: +n, r: +r, p: +p });
    const expected = Buffer.from(hash, 'hex');
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/** Constant-time string compare that never leaks through length or early exit. */
function safeEqualStr(a, b) {
  const da = crypto.createHash('sha256').update(String(a)).digest();
  const db = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(da, db);
}

/**
 * Verifies a credential pair. Always runs a real scrypt verification against a
 * fixed target, so response timing does not reveal whether the username or the
 * password was the part that failed.
 */
function credentialsMatch(username, password) {
  const userOk = safeEqualStr(username || '', ADMIN_USERNAME);
  const target = userOk
    ? (adminRecord ? adminRecord.password : envPasswordHash())
    : DUMMY_HASH;
  const passOk = verifyPassword(password || '', target);
  return userOk && passOk;
}

function envPasswordHash() {
  if (!envHashCache) envHashCache = hashPassword(ADMIN_PASSWORD);
  return envHashCache;
}

/* ---------------- session cookie (signed, not encrypted) ---------------- */

function createSessionToken() {
  const payload = {
    role: 'admin',
    iat: Date.now(),
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  return `${body}.${mac}`;
}

function verifySessionToken(token) {
  if (typeof token !== 'string') return null;
  const dot = token.indexOf('.');
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const given = Buffer.from(token.slice(dot + 1), 'base64url');
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest();
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload || typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/* ---------------- cookie plumbing (no cookie-parser dependency) ---------------- */

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  for (const part of String(header).split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    const raw = part.slice(eq + 1).trim();
    try { out[key] = decodeURIComponent(raw); } catch { out[key] = raw; }
  }
  return out;
}

function sessionCookie(token) {
  const attrs = [
    `${COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ];
  if (process.env.NODE_ENV === 'production') attrs.push('Secure');
  return attrs.join('; ');
}

function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

/* ---------------- request helpers / middleware ---------------- */

function getSessionFromReq(req) {
  return verifySessionToken(parseCookies(req.headers.cookie)[COOKIE_NAME]);
}

function isAdminReq(req) {
  return Boolean(getSessionFromReq(req));
}

/** Guards every admin-only endpoint. 401 — the session is simply absent or stale. */
function requireAdmin(req, res, next) {
  if (isAdminReq(req)) return next();
  return res.status(401).json({ error: 'Admin authentication required.' });
}

/** ObjectId of the seeded admin user, for `createdBy`; null when Mongo is down. */
function getAdminUserId() {
  return adminRecord ? adminRecord._id : null;
}

/* ---------------- login rate limiting (in-memory, per IP) ---------------- */

const attempts = new Map(); // key -> { count, resetAt }
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function checkRateLimit(key) {
  const now = Date.now();
  if (attempts.size > 1000) {
    for (const [k, v] of attempts) if (v.resetAt < now) attempts.delete(k);
  }
  const entry = attempts.get(key);
  if (!entry || entry.resetAt < now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }
  entry.count += 1;
  if (entry.count > MAX_ATTEMPTS) {
    return { allowed: false, retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
  }
  return { allowed: true, retryAfter: 0 };
}

function clearRateLimit(key) {
  attempts.delete(key);
}

/* ---------------- boot-time seeding ---------------- */

/**
 * Seeds (or re-syncs) the admin user from env. Called once at server boot.
 * Failure is non-fatal: without MongoDB the env hash still authenticates, only
 * `createdBy` stays null.
 */
async function ensureAdminUser() {
  try {
    let existing = await User.findOne({ email: ADMIN_USERNAME });
    if (!existing) {
      existing = await User.create({
        fullName: 'Portal Administrator',
        email: ADMIN_USERNAME,
        password: hashPassword(ADMIN_PASSWORD),
      });
      console.log('[auth] seeded admin user into the users collection');
    } else if (!verifyPassword(ADMIN_PASSWORD, existing.password)) {
      // ADMIN_PASSWORD changed in env — keep the stored hash in sync on boot.
      existing.password = hashPassword(ADMIN_PASSWORD);
      await existing.save();
      console.log('[auth] ADMIN_PASSWORD changed — admin hash re-seeded');
    }
    adminRecord = existing.toObject();
  } catch (err) {
    console.warn('[auth] admin seeding skipped (MongoDB not reachable?):', err.message);
  }
}

module.exports = {
  COOKIE_NAME,
  SESSION_TTL_SECONDS,
  createSessionToken,
  clearSessionCookie,
  sessionCookie,
  credentialsMatch,
  isAdminReq,
  requireAdmin,
  getAdminUserId,
  checkRateLimit,
  clearRateLimit,
  ensureAdminUser,
};

