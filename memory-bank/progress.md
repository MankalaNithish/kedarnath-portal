# Progress

## Render + Atlas deploy prepared (2026-09-30)
Option A executed: `render.yaml` Blueprint (node runtime, NODE_VERSION=22,
singapore, free plan, `npm start`) + `SETUP.md` §7 production guide (Atlas M0,
secrets, Blueprint flow, curl smoke test, verification, ops notes) + 3 new
troubleshooting rows. Build clean (15/15 pages). Two commits pushed: the
gallery/news feature, then deploy tooling + docs. Outstanding (manual, in
browser): create the Atlas M0 cluster, create the Render Blueprint service,
paste env values, run §7.4, park Vercel. `package-lock.json` remains
git-ignored → Render does `npm install`; commit the lockfile later if
reproducibility matters.

## Re-verified 2026-09-28 (post-change sanity pass)
Build clean; full live suite green again vs Docker mongo:6 @28017 (login/session
cookie/rate limit/401s, gallery upload→image→patch→delete, news draft lifecycle
+ dup-slug 400, all 10 pages 200, DB left clean). Collections are Mongoose-
pluralized lowercase: `newsarticles`, `galleryitems`, `users`, `posts`.

## What works (verified 2026-09-19)
- Home static gallery, about, members, donation, reviews (Firestore), posts page,
  login — all 200 after the Gallery/News changes (regression-checked).
- **Gallery**: public grid w/ category filters + keyboard lightbox; admin
  multi-upload w/ client-side compression, edit, delete (confirm dialog).
- **News**: public feed (featured + cards, search, filters) and article pages;
  admin editor w/ auto-slug, cover image, draft/publish lifecycle.
- **Auth**: `/api/v1/auth/{login,logout,session}`; scrypt-seeded admin user;
  HMAC-signed HttpOnly cookie; rate-limited login; `requireAdmin` on all writes.

## API surface (all verified by direct curl)
- `POST /api/v1/auth/login|logout`, `GET /api/v1/auth/session`
- `GET/POST /api/v1/gallery`, `PATCH/DELETE /api/v1/gallery/:id`,
  `GET /api/v1/gallery/:id/image` (immutable cache)
- `GET/POST /api/v1/news` (server filters drafts for non-admins),
  `GET /api/v1/news/:idOrSlug` (drafts 404 publicly),
  `PATCH/DELETE /api/v1/news/:id`, `GET /api/v1/news/:idOrSlug/cover`

## Build status
`npm run build` passes. ESLint clean (2 acceptable img warnings).

## Known issues / limitations
- `/api/v1/posts` 404: PRE-EXISTING (json-server 404 handler shadows restify;
  verified identical on unmodified HEAD).
- Vercel cannot run server.js → gallery/news/admin APIs need Node hosting.
- No plain mongod on this machine (27017 = TLS replica set of another system);
  local testing used Docker mongo:6 on 28017 (container `kedar-test-mongo`).
- Restify `/api/v1/users` unauthenticated (legacy, deliberately untouched).

## Not yet done
- Browser smoke-test of the admin UI flows (API layer fully verified by curl).
- Production Atlas M0 cluster + real ADMIN_SESSION_SECRET.