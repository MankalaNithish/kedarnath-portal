/**
 * Auth endpoints: /api/v1/auth/{login,logout,session}
 * Mounted by server.js after the body parsers.
 */
const express = require('express');
const auth = require('../auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const key = req.ip || 'unknown';
  const limit = auth.checkRateLimit(key);
  if (!limit.allowed) {
    res.setHeader('Retry-After', String(limit.retryAfter));
    return res.status(429).json({ error: `Too many attempts. Try again in ${limit.retryAfter}s.` });
  }

  const { username, password } = req.body || {};
  if (!auth.credentialsMatch(username, password)) {
    return res.status(401).json({ error: 'Your login credentials are not correct.' });
  }

  auth.clearRateLimit(key);
  res.setHeader('Set-Cookie', auth.sessionCookie(auth.createSessionToken()));
  return res.json({ ok: true, isAdmin: true });
});

router.post('/logout', (req, res) => {
  res.setHeader('Set-Cookie', auth.clearSessionCookie());
  return res.json({ ok: true });
});

router.get('/session', (req, res) => {
  return res.json({ isAdmin: auth.isAdminReq(req) });
});

module.exports = router;
