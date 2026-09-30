# Gallery & News — Implementation Plan

Status: APPROVED. Supersedes all earlier drafts; includes the zero-cost storage decision.
Scope: ADDITIVE ONLY. No existing feature, route, API, or business logic is removed or rewritten.

## 1. Goal
Add two production-ready sections to the kedarnath-portal — a public **Gallery** and
**News** — with full admin management, backend-enforced authorization, and real
MongoDB persistence. No mock data, no fake buttons, no TODOs.

## 2. Existing architecture (verified facts this plan builds on)
- Next.js 13 (Pages Router) + MUI v5 custom theme (`theme/tokens.js`), framer-motion
  with reduced-motion support (`components/motion.js`).
- Custom Express server (`server.js`) wrapping Next. MongoDB via Mongoose
  (`MONGODB_URI`), `express-restify-mongoose` exposing `/api/v1/posts|users`,
  `multer` memory uploads, images stored as Buffers (`models/post.js`).
- json-server (`db.json`) mounted at `/api/v1` (legacy reviews); Firestore is used
  client-side by `/reviews` only, protected by `firestore.rules`.
- Existing "admin" model: single hardcoded credential pair checked client-side in
  `pages/login.js` (`kedarnathadmin` / `adminkedar3456`), flagged in sessionStorage.
  There is no server-side auth or role system anywhere today.
- Home page has a static 22-photo gallery — DO NOT TOUCH.
- mongod runs locally on 27017; node v22; ports 3000/3001 are busy (test on 3100).

## 3. Storage decision (zero cost)
- **MongoDB Atlas M0 free cluster (512 MB, $0)** for everything: admin credentials,
  news text, gallery/news image binaries + metadata. Already the project's DB —
  zero architectural change. Local dev keeps using the local mongod.
- Client-side compression before upload (canvas, no new deps): max 1920px + JPEG
  quality ~0.8 → ~100–300 KB/photo → thousands of photos fit in 512 MB.
- Known caveats (documented in SETUP.md): M0 pauses after 30 days idle (one-click
  resume); `server.js` does not run on Vercel serverless, so API-served images and
  admin require the Node server (identical to the pre-existing `/posts` limitation).

## 4. Auth & authorization (backend-enforced, additive)
Model (exactly as required):
  Viewer (everyone): Gallery READ, News READ (published only)
  Admin:            Gallery & News CREATE / READ / UPDATE / DELETE
- Reuse the portal's single-admin model. Do NOT create a second auth system.
- `POST /api/v1/auth/login` — server-side constant-time verification, rate-limited
  (5 attempts / 15 min / IP), sets a signed **HttpOnly, SameSite=Lax** session
  cookie (HMAC-SHA256 via node `crypto`; ~12h expiry). No new dependencies.
- Admin credential hash stored in the `users` collection (node `crypto.scrypt`,
  random per-user salt), seeded from env on first boot:
  `ADMIN_USERNAME`, `ADMIN_PASSWORD` (defaults = current hardcoded pair so the
  existing login keeps working), `ADMIN_SESSION_SECRET` for cookie signing.
- `GET /api/v1/auth/session` → `{ isAdmin: true|false }`; `POST /api/v1/auth/logout`.
- `pages/login.js` stays as-is behaviorally: it now calls `/auth/login` first; on
  success sets the existing sessionStorage flag (unchanged) and links to `/admin`.
  If the API is unreachable (static deploy), legacy client-side path still works
  and a toast explains admin APIs need the Node server. Existing behavior preserved.
- Every gallery/news write route checks the cookie server-side → **401** otherwise.
  Frontend gating is cosmetic; the API is the enforcement point.

## 5. Data models (MongoDB, project conventions: `models/*.js` CommonJS)
`models/galleryItem.js`
  title (String, trim), caption (String), description (String), category (String),
  displayOrder (Number, default 0), image: { data: Buffer, contentType: String,
  originalName: String, size: Number }, createdBy: ObjectId ref 'User',
  timestamps: true
`models/newsArticle.js`
  title, slug (unique, lowercase), summary, content, category, published (Bool,
  default false), publishedAt (Date), coverImage {…same shape as above},
  createdBy ref 'User', timestamps: true
Both registered additively in `models/index.js`. Schema is extensible (e.g. tags
later) without migration.

## 7. Frontend (design-system native; reuses theme/motion/state components)
Public:
- `pages/gallery.js` — responsive grid (2/3/4 cols), hover zoom, category filter
  chips, lightbox (keyboard arrows/Esc, captions, counter), lazy `<img>`,
  GallerySkeleton, EmptyState, ErrorState. Follows home page's existing gallery
  patterns and motion conventions.
- `pages/news.js` — featured (latest published) hero + card grid, category chips +
  search (`q`), NewsSkeleton, EmptyState, ErrorState.
- `pages/news/[slug].js` — reading experience: cover, title, date/category,
  readable measure (~65ch) prose column, related recent articles, 404 state.
Admin (`pages/admin.js`, gated by `/auth/session`):
- MUI Tabs: **Gallery** | **News**. Unauthenticated → EmptyState "Not authorized"
  with link to `/login`. 401 API responses → toast + re-gate.
- Gallery tab: upload dialog (multi-select, per-file compression + progress,
  client validation of type/size before send), edit dialog (title, caption,
  description, category, displayOrder), delete with ConfirmDialog, toasts.
- News tab: create/edit dialog (title, auto slug with edit, category, summary,
  content, cover upload + preview, publish switch), list rows with
  publish/unpublish chip + edit + delete (ConfirmDialog), toasts.
New client helpers & components:
- `lib/client/api.js` (fetch wrapper, `credentials: 'same-origin'`)
- `lib/client/imageCompress.js`, `lib/client/slug.js`, `lib/client/useAdminSession.js`
- `components/ConfirmDialog.js`, `components/GalleryLightbox.js`, `components/NewsCard.js`
- `components/SkeletonCard.js` — ADD exports: GallerySkeleton, NewsSkeleton,
  AdminRowSkeleton (existing exports untouched)

## 8. Navigation
`components/layout.js`: add `{ Gallery, '/gallery' }` and `{ News, '/news' }` to
the existing `pages` array (desktop nav + mobile drawer pick it up automatically).
No duplicate nav system. Admin controls exist only inside `/admin`; the login
page's logged-in state gains a "Go to admin portal" button (additive).

## 9. Implementation order
1. PLAN.md (this file) + memory-bank files
2. `.env`/`.env.example` additions (ADMIN_*, notes)
3. `lib/server/auth.js` (cookie sign/verify, requireAdmin, login rate limiter,
   ensureAdminUser boot seeding via scrypt)
4. `models/galleryItem.js`, `models/newsArticle.js`, `models/index.js` update
5. `lib/server/routes/{auth,gallery,news}.js` + additive mounts in `server.js`
6. Client helpers + shared components (ConfirmDialog, lightbox, NewsCard, skeletons)
7. `pages/gallery.js`, `pages/news.js`, `pages/news/[slug].js`
8. `pages/admin.js`
9. `components/layout.js` nav lines, `pages/login.js` additive server login + link
10. `SETUP.md` additions (Atlas M0, admin env vars, idle-pause + Vercel caveats)
11. Full verification (below), fix, re-verify

## 10. Verification plan (server on PORT=3100, local mongod)
Build/regression:
- `npm run build` passes; pages 200 via curl: /, /about, /members, /reviews,
  /donation, /login, /posts, /gallery, /news, /admin, /news/<slug>
- `GET /api/v1/posts` (Mongo) and `GET /api/v1/reviews` (json-server) still 200;
  home static gallery untouched
Security (direct API, no UI):
- anon: GET gallery 200; GET news (published only); GET draft slug → 404;
  POST/PATCH/DELETE on gallery+news → **401**; forged cookie → 401
- admin cookie: full CRUD works; publish/unpublish toggles; list includes drafts
- validation: disallowed type (.gif/.txt) → 400, >8 MB → 400, missing title → 400,
  duplicate slug → 400
Viewer UX: browse, filter, lightbox, read article; NO admin controls visible
Admin UX: upload (progress + invalid/oversized handling), edit, delete w/ confirm,
create/edit news, publish toggle, toasts on success/failure
Responsive: grid/card/article layout at 375/768/1280 widths

## 11. Files touched (summary)
NEW: PLAN.md, models/galleryItem.js, models/newsArticle.js, lib/server/auth.js,
lib/server/routes/{auth,gallery,news}.js, lib/client/{api,imageCompress,slug,
useAdminSession}.js, components/{ConfirmDialog,GalleryLightbox,NewsCard}.js,
pages/{gallery,news,admin}.js, pages/news/[slug].js, memory-bank/*.md
MODIFIED (additive): models/index.js, server.js, components/layout.js (2 nav
lines), components/SkeletonCard.js (new exports), pages/login.js (server login +
link), .env.example, SETUP.md
NOT TOUCHED: pages/index.js (static gallery), firestore.rules, reviews flow,
members/about/donation, responsiveappbar/applicationbar, package.json deps

## 12. Known limitations (report at the end)
1. Vercel serverless can't run server.js → Gallery/News + admin APIs need the Node
   server (same pre-existing limitation as /posts; documented, not a regression).
2. Legacy restify endpoints (`/api/v1/posts|users`) remain unauthenticated —
   pre-existing behavior, deliberately untouched per the do-not-break rule.
3. Images in MongoDB: fine at portal scale with compression; R2/Cloudinary is the
   later upgrade path past ~2,500 photos.
4. Single-admin model (matches the portal's design); multi-role would be new work.
