# Progress

## news.js `Link` crash fix (2026-10-01, latest)
- User hit "client error" on /news — but ONLY when logged in. Root cause:
  pages/news.js used `component={Link}` on the admin-only "Write article"
  button without `import Link from 'next/link'`. Anonymous visitors never
  evaluate that JSX branch (`isAdmin` false), so every anon probe passed;
  the moment a logged-in admin opened /news, React crashed with
  `ReferenceError: Link is not defined` (client-side exception page).
- Fixed dd4ceb2 (one-line import), lint-clean, pushed. Repo-wide audit: every
  other `component={Link}` user (gallery.js, layout.js, index.js, admin.js,
  NewsCard.js) already imports Link — news.js was the only offender.
  NOTE: because Render has NOT deployed since 34aaec0, this fix rides the
  same stalled-deploy queue as cbdfe6e; prod is still on the old build and
  (old build) has its own admin-gated news JSX — verify prod after deploy.
- Verified in headless Chrome (CDP): login → /news as admin → 4 headlines,
  "Write article" link present (renders as `a[href="/admin?write=1"]`,
  NOT a <button> — MUI `component={Link}`), click lands on /admin with the
  news editor, zero client errors. Also confirmed BY DESIGN (not bugs):
  drafts never appear on /news even for admins (server filters
  `published:true` unless `?includeDrafts=1`; drafts are managed in /admin),
  and the draft card lives only in the admin portal.


## Admin Add-buttons FIX (2026-10-01)
- Root cause of "Add buttons not responding": GalleryTab + NewsTab early-
  returned loading/failed/empty-list branches ABOVE their <Dialog> JSX, so on
  an empty DB the dialogs were never in the tree — every button press toggled
  state that nothing rendered. Fixed with a single-return `content` structure
  in both tabs (pages/admin.js); dialogs now always mounted.
- Bonus fixes found during verification: ?write=1 deep link used to open an
  empty editor shell (no draft fields, Save would crash) — NewsTab now seeds
  emptyDraft() when dialog==='new'; removed a redundant setNewsFailed(false).
- Verified in headless Chrome (CDP via ws) against mongo:6 on 28017 + prod
  server on 3108: 19/19 checks — login→/admin, both buttons open dialogs on
  the EMPTY-state branch, real image upload (compress→POST 201→grid image→
  toast), article create (201→auto-slug→list row→toast), ?upload=1 and
  ?write=1 deep links. Clean 15/15 build; lint = 2 pre-existing posts.js
  warnings only. DB left empty; test server stopped.
- Committed e88d6b8 (fix) + 8dc7790 (docs) and pushed — but live-site
  verification then exposed that production (buildId nx_MGC_ycF2GoJoJiCoPT)
  predates even 34aaec0: the last FOUR pushes never deployed. Render
  auto-deploy stalled (dashboard Events/Logs needed to see why); retriggered
  with empty commit cbdfe6e and watching buildId (/tmp/kedar-poll.log).
  Production browser test ready at /tmp/kedar-prod-test.js (login → Add
  buttons → real upload → draft article → deep links → deletes both test rows,
  leaving prod DB pristine) — rerun it after the deploy lands.

## PRODUCTION VERIFIED (2026-09-30)
Site live at https://kedarnath-portal.onrender.com — 15/15 live checks green
(pages, auth incl. defaults login, gallery upload→image→delete, news
draft→hidden→publish→visible→delete, forged-cookie 401s incl. public-secret
attempt, pristine DB after cleanup). Render's generated ADMIN_SESSION_SECRET
confirmed live (public-secret cookie rejected). Only follow-ups: park Vercel,
optional warm-up pinger, optional strong ADMIN_PASSWORD later.

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

## Admin-buttons UX round (2026-09-30, latest)
- Login now lands on /admin (34aaec0); public /gallery + /news show
  "Upload photos" / "Write article" buttons ONLY for a verified admin
  session (ac1671f) — they deep-link to /admin?upload=1 / /admin?write=1
  and the portal opens the matching dialog directly.
- Clean local build (16 routes) + lint green; pushed; Render auto-deploy
  verified by buildId comparison, live-bundle greps, session-API smoke.
- Still open: park old Vercel project; optional warm-up pinger; optional
  ADMIN_PASSWORD rotation (hash re-seeds on restart).

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