# System Patterns

## Architecture
```
Browser ── Next.js pages (MUI theme + framer-motion)
   │  reviews  → Firebase JS SDK → Firestore (firestore.rules)
   │  posts    → axios /api/v1/posts ─┐
   │  gallery/news/admin → /api/v1/* ─┤ custom Express (server.js)
   └── static content (home/about/members/donation) — no backend
                                        │
        Express: Next handler + restify (posts,users) + json-server (db.json)
                 + custom routes /api/v1/{auth,gallery,news} (MongoDB/Mongoose)
```

## Key patterns
- **Custom server is the API layer.** `server.js` mounts Next after Express
  routes. `pages/api/*` exists (hello.js) but the live APIs are Express.
- **Mongoose models in `models/*.js`**, CommonJS, registered in `models/index.js`.
  Binary images live as `{ data: Buffer, contentType, originalName }` docs.
- **Shared UI state components**: `Toast` (`{open,message,severity}`),
  `EmptyState` (icon/title/description/action), `ErrorState` (title/desc/onRetry),
  `SkeletonCard` exports content-shaped skeletons. Always use these, not ad-hoc.
- **Motion discipline**: all variants via `useAnimation()/useStagger()` from
  `components/motion.js` (reduced-motion aware). Tokens: `theme/tokens.js`
  (motion.fast/base/slow, ease [0.22,1,0.36,1]). No springs on this subject.
- **Layout**: every page wraps content in `<Layout>` (appbar + drawer + footer);
  nav pages array lives in `components/layout.js`.
- **Client pages are CSR** (`useState/useEffect` + axios/fetch); no SSR data fns.
- **Auth (since Gallery/News)**: single admin; HttpOnly signed cookie via
  `lib/server/auth.js`; session check = `GET /api/v1/auth/session`; write routes
  call `requireAdmin`. sessionStorage flag remains a UI hint only.

## Conventions
- JS (no TS). MUI `sx` prop styling. `@/*` path alias.
- Absolute hrefs in nav so they resolve from any path.
- Images: `next/image` for static files; plain `<img>`/Buffer-serving route for
  Mongo binaries (base64 data URIs are only used by the legacy PostImage).
