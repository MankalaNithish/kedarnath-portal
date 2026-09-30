# Active Context

## Current focus (2026-09-30)
**Deploy = Option A executed: Render + MongoDB Atlas.** (User approved after
the Vercel-vs-pages/api comparison; rationale from the 09-28 decision stands.)
Delivered in repo:
- `render.yaml` Blueprint (repo root): ONE web service — runtime node, plan
  free, region singapore, build `npm install && npm run build`, start
  `npm start` (prod `server.js`); `NODE_VERSION=22` pinned (dev box runs
  22.22). envVars: MONGODB_URI / ADMIN_USERNAME / ADMIN_PASSWORD `sync:false`,
  ADMIN_SESSION_SECRET `generateValue:true` (Render generates at first
  apply), 6× NEXT_PUBLIC_FIREBASE_* `sync:false`;
  NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST deliberately ABSENT. YAML lint-verified.
- `SETUP.md` §7 "Deploy to Render + MongoDB Atlas (production)": Atlas M0
  Mumbai walkthrough (db user, 0.0.0.0/0, SRV URI with `/kedarnath` path),
  openssl secret recipes, Blueprint flow, curl smoke test (session false →
  login → session true → /gallery /news 200 → gallery list → reviews 200),
  Atlas collection verification (pluralized lowercase), Render log check
  (no `[mongo] connect failed`), post-deploy notes (15-min sleep + pinger,
  mongodump backups, $7 scale-up), 3 troubleshooting rows. ToC updated.
- Build re-verified clean (15/15 pages, warnings unchanged). Zero code
  changes needed for Render: server.js already reads PORT and host env wins
  over .env by loader design.
- Secrets: ADMIN_SESSION_SECRET + ADMIN_PASSWORD generated in-session
  (openssl) and handed to the user for dashboard entry — values intentionally
  NOT recorded here; user advised to treat as sensitive and rotate if this
  transcript is ever considered exposure.
- Caveat flagged: `package-lock.json` is git-ignored (legacy decision), so
  Render runs `npm install` (range resolution), not `npm ci` — reproducibility
  trade-off; consider committing the lockfile later if builds drift.
Remaining manual steps (user, in browser): create Atlas M0 (user + allowlist
+ URI), create the Render Blueprint service, paste env values, run the §7.4
smoke test, park the Vercel project.

## Current focus (2026-09-19)
**Gallery & News feature — IMPLEMENTED AND VERIFIED.** Plan in `PLAN.md` (§9 order
followed); SETUP.md documents admin setup and caveats.

## Session follow-ups (2026-09-19, later)
- Nav: "Admin Login" added to the shared nav array in `components/layout.js`
  (desktop bar + mobile drawer both render from it). User requested it visible.
- **Prod-mode fix (root-caused user bug):** "Upload Photos" button dead + HMR
  404s = server ran Next in DEV mode (`server.js` gates on NODE_ENV) against a
  prod `.next`. `npm start` now sets `NODE_ENV=production`. Never mix
  `next dev`-compiled state with a prod build.
- **Env loader added to server.js:** node server.js never read `.env` before
  (verified empirically: changed password → 401 under old loader-less boot).
  Loader: `.env.local` > `.env` > real env (real env never overridden);
  `KEDAR_SKIP_DOTENV=1` disables; quotes stripped dotenv-style.
- **ENV POLICY (user decision): `.env` IS COMMITTED** with safe defaults only
  (local Mongo URI, PORT, historical creds kedarnathadmin/adminkedar3456 — same
  pair already hardcoded in auth.js fallbacks & login page). Real secrets →
  `.env.local` (git-ignored). `.env` removed from index once, then re-added per
  user. `.gitignore` keeps only `.env*.local`. `.env.example` mirrors defaults.
- **Crash fix:** `mongoose.connect()` had no error handling — an unreachable DB
  (e.g. Atlas paused) killed the whole server at boot. Now `.catch()` logs and
  the site keeps serving. Verified: boot with dead URI → pages still 200.
- Verified in prod mode: zero HMR refs, login→200, real upload→201→delete→200.

## State
- Build: `npm run build` passes clean (all 15 pages incl. /gallery, /news,
  /news/[slug], /admin). ESLint: 0 errors; only expected `no-img-element`
  warnings for Mongo-streamed binaries (same as legacy PostImage).
- Integration-tested live (PORT=3100, throwaway Docker mongo:6 on 28017):
  login 401/200 + cookie, session gate, gallery upload 201/list/image bytes 200,
  gif→400, missing title→400, anon writes→401, forged cookie→401,
  draft hidden from anon list + detail 404 until published, publish PATCH sets
  publishedAt, dup-slug auto-uniqued (-2), rate limit 429 after 5 fails,
  deletes work; all 10 pages 200; home static gallery untouched; /api/v1/reviews 200.
- `/api/v1/posts` 404 confirmed PRE-EXISTING (original server.js 404s identically
  — json-server's 404 handler shadows it; SETUP.md documented this).
- Environment note: this machine has NO local plain mongod (27017 is a TLS/x509
  replica set from another system). Tests used Docker mongo:6 on 28017.

## Bugs found & fixed during verification
1. Routes live 3 dirs deep — model requires needed `../../../models/...`.
2. News POST rejected articles with no cover (400 "no file data") — cover is
   optional; fixed to validate only when present.
3. JSX typo in admin NewsTab (`</slug>`); build caught it.

## Re-verification pass (2026-09-28)
Full live re-test after the session's changes — **all green**:
- `npm run build` clean (15/15 pages). Warnings only: `no-img-element` ×2
  (Mongo-streamed binaries, expected) + `exhaustive-deps` ×3 (admin/gallery/posts).
- Server on PORT=3107 vs Docker mongo:6 @28017: bad login 401, good login
  200 + HttpOnly cookie, session flag flips, forged cookie 401, anon writes 401,
  gallery upload 201 → image bytes 200 (content-type + 65038 bytes) → patch 200
  → delete 200, news draft 201 → hidden from anon list + detail 404 → publish
  200 → detail 200, dup-slug 400 (11000 guard), delete 200, rate limit 429 on
  6th bad attempt, logout clears cookie, all 10 pages 200. DB left clean
  (users=1 seeded admin, news=0, gallery=0).
- **Collection-name gotcha:** Mongoose pluralizes — collections are
  `newsarticles`, `galleryitems`, `users`, `posts` (all lowercase). Querying
  `db.newsArticles` in mongosh silently creates/reads an EMPTY namespace and
  misleads diagnosis. Always use the pluralized lowercase names.
- A stale `node server.js` from an earlier session is still listening on 3100
  (pid 1641583) — left untouched; it holds the port, so tests used 3107.

## User question — Vercel + MongoDB (answered 2026-09-28)
**No — as-is, Vercel cannot reach MongoDB.** Vercel ignores `npm start`;
`server.js` (the ONLY Mongo client: auth/gallery/news routes, seeding,
restify) never runs there, and there are no `pages/api` equivalents. What
survives on Vercel: all static pages, Firestore reviews, the login PAGE
(via legacy client-side fallback + warning toast). What breaks: admin
session, /admin portal, gallery/news APIs. Paths forward (in SETUP.md's
spirit, zero-budget):
1. **Recommended:** run the Node server on Railway/Render/Fly free tier +
   MongoDB Atlas M0. Zero code changes; set MONGODB_URI (SRV), ADMIN_*,
   strong ADMIN_SESSION_SECRET in the host env (host env > .env by design).
   In-memory rate limiting + cookie sessions work as-is.
2. Port auth/gallery/news to `pages/api/*` serverless functions. Needs:
   Mongoose connection caching (global pattern), Atlas IP allow 0.0.0.0/0
   (Vercel egress is dynamic), rate limiting becomes per-instance (weak),
   Vercel 4.5 MB body cap vs 8 MB image limit (lower MAX_IMAGE_BYTES or use
   external image storage). Stateless HMAC cookie survives serverless fine.

## Hosting decision — where to deploy for free (2026-09-28)
**Recommendation: Render free Web Service + MongoDB Atlas M0.** Only combo
that is genuinely free, no credit card, and runs `server.js` unchanged:
- Render free WS: Node from Git, 750 instance hrs/mo, 512MB/0.1vCPU, spins
  down after 15 min idle (~1 min wake), custom domain + TLS free, no disk
  (fine — images live in Mongo, db.json comes from the repo).
- Atlas M0: permanently free, 512MB storage; pauses only after ~6 months idle.
- Build `npm install && npm run build`, Start `npm start` (npm start sets
  NODE_ENV=production → Secure cookie over Render HTTPS ✅). Render injects
  PORT which server.js already reads ✅. Host env > .env by the loader design ✅.
- Env vars to set in Render: MONGODB_URI (Atlas SRV), ADMIN_USERNAME,
  ADMIN_PASSWORD (new strong), ADMIN_SESSION_SECRET (openssl rand -hex 32),
  6× NEXT_PUBLIC_FIREBASE_*. NEVER set NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST.
- Atlas: DB user + Network Access 0.0.0.0/0 (Render egress is dynamic).
- Deploy one origin (Render serves pages + APIs). Don't split Vercel-static +
  Render-API — pages use relative /api/v1 URLs; a split would need CORS.
  Retire/park the Vercel project instead.
- Ruled out: Railway ($1/mo credit = paid), Fly.io (no free tier for new
  users), Koyeb (free instance but requires card), Glitch (shut down 2025),
  OCI Always Free (free but DIY VM + ops overhead). Sleep-wake ~1 min is the
  only real trade-off; optional mitigation: uptime pinger every 10 min.

## Next steps
- Real Atlas M0 cluster for production; set ADMIN_* + strong session secret.
- Optional: smoke-test the /admin UI in a browser (API layer fully verified).

## Watch-outs
- `.next` corruption: never run `next build` while `node server.js` dev-compiles.
- Test mongod container `kedar-test-mongo` (port 28017) is disposable (--rm).

