# Tech Context

## Stack (verified from package.json / source)
- **Next.js 13.2.4, Pages Router** (`pages/`), React 18, plain JS (no TS).
- **MUI v5** (`@mui/material`, `@mui/icons-material`) with custom theme
  (`theme/index.js` builds from `theme/tokens.js` tokens; light+dark).
- **framer-motion** — shared variants in `components/motion.js`; every animated
  component goes through `useAnimation()/useStagger()` which collapse to instant
  state changes under `prefers-reduced-motion`. Global CSS also kills animations.
- **Custom Express server** (`server.js`) wrapping Next via
  `nextApp.getRequestHandler()`; `npm start` runs it
  (`NODE_ENV=production node server.js` — prod mode is set by the script, see
  activeContext for the dev/prod-mismatch bug this fixed);
  `npm run dev` runs plain `next dev` (API routes in `pages/api/*` only).
- **MongoDB via Mongoose 6** — `MONGODB_URI` env; models in `models/*.js`
  (CommonJS, default export via `module.exports`). Images stored as
  `{ data: Buffer, contentType, originalName }` subdocuments.
- **express-restify-mongoose** auto-exposes `/api/v1/posts|users` (unauthenticated
  legacy endpoints — pre-existing, do not break).
- **json-server** mounts `db.json` at `/api/v1` (legacy reviews route).
- **Firebase JS SDK (client-only)** for reviews — Firestore live `onSnapshot`;
  protected by `firestore.rules` (create/read only, immutable docs). Emulator via
  `NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST`; `npm run emulator`.
- **multer** memory storage for uploads (existing createPost route).
- **axios** used by `pages/posts.js` for the restify API.

## Environment
- `.env` is COMMITTED with safe defaults only (`MONGODB_URI` local 27017,
  `PORT=3002`, historical admin creds). Real secrets go in `.env.local`
  (git-ignored), which overrides `.env`; host env vars win over both.
  `server.js` has a small no-dependency loader for both files (see
  activeContext). `.env.example` documents every variable.
- Next.js env access: only `NEXT_PUBLIC_*` reaches the browser; server secrets
  live in process env read inside `server.js`.
- `jsconfig.json` maps `@/*` → project root. ESLint: `next/core-web-vitals`.

## Deployment reality (SETUP.md)
- **Vercel** runs `next build` only — `server.js`, json-server, restify and Mongo
  do NOT run there. `/posts` already 404s on Vercel (documented as accepted).
  Anything requiring the Node server (Gallery/News APIs, admin) has the same
  limitation; the static pages still deploy fine.

## Commands
- `npm run dev` — plain Next dev (client pages only, no custom-server APIs).
- `npm run build` / `npm start` — production build / custom server (APIs live).
- `npm run emulator` — Firestore emulator for reviews testing.
