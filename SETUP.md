# Setup

The reviews feed is backed by **Cloud Firestore**. Everything else on the site
(home, about, members, donation) is static and needs no configuration.

Reviews use a live `onSnapshot` subscription, so a review posted by any visitor
appears in every open browser without a reload or any polling.

- [1. Create the Firebase project](#1-create-the-firebase-project)
- [2. Publish the security rules](#2-publish-the-security-rules)
- [3. Get the config values](#3-get-the-config-values)
- [4. Run locally against real Firestore](#4-run-locally-against-real-firestore)
- [5. Test locally with the Firestore emulator](#5-test-locally-with-the-firestore-emulator)
- [6. Deploy to Vercel](#6-deploy-to-vercel)
- [7. Deploy to Render + MongoDB Atlas (production)](#7-deploy-to-render--mongodb-atlas-production)
- [Troubleshooting](#troubleshooting)

---

## 1. Create the Firebase project

At <https://console.firebase.google.com> create a project, then
**Build → Firestore Database → Create database**.

| Setting | Choose | Why |
|---|---|---|
| Edition | **Standard** | Enterprise edition is a MongoDB-compatible product driven by MongoDB drivers, not the Firebase web SDK this app uses. |
| Mode | **Native mode** | Datastore mode has no realtime listeners. `onSnapshot` requires Native. |
| Database ID | **`(default)`** | `lib/firebase.js` calls `getFirestore(app)`, which targets `(default)`. |
| Location | **`asia-south1` (Mumbai)** | Closest region. **Permanent — it cannot be changed later.** |
| Rules | **Start in production mode** | Test mode allows open read *and write* to anyone for 30 days. |

Do **not** create the `reviews` collection by hand. Firestore creates
collections implicitly on first write, so `addDoc` makes it when the first
review is posted. An empty database immediately after setup is correct — the
page will show "No reviews yet".

## 2. Publish the security rules

Production mode denies everything by default, including reads, so reviews will
not load until you do this.

Copy [`firestore.rules`](./firestore.rules) into
**Firestore → Rules** in the console and click **Publish**.

The rules allow anyone to read and create a review, and deny every update and
delete. That is deliberate: the previous json-server endpoint accepted
unauthenticated `DELETE` and `PUT`, so any stranger could wipe or rewrite every
review.

The file also caps a review at 2,000 characters and a name at 80, so nobody can
burn the free quota by writing huge documents.

> The trailing `match /{document=**} { allow read, write: if false; }` does
> **not** override the `reviews` rule. Firestore grants access if *any* matching
> rule allows it.

## 3. Get the config values

**Project settings** (gear icon, top-left) **→ Your apps**. If no web app exists,
click the **`</>`** icon and register one — skip the "Firebase Hosting" step,
since this deploys to Vercel. Then under **SDK setup and configuration** choose
**Config**:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123"
};
```

Maps one-to-one onto the variables in [`.env.example`](./.env.example):

| Config key | Environment variable |
|---|---|
| `apiKey` | `NEXT_PUBLIC_FIREBASE_API_KEY` |
| `authDomain` | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` |
| `storageBucket` | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `NEXT_PUBLIC_FIREBASE_APP_ID` |

### These are not secrets

A Firebase web config is a public identifier. It ships in the JavaScript bundle
by design and Google documents it as safe to expose. What protects the data is
`firestore.rules`, not the secrecy of these values.

That said, `.gitignore` here only excludes `.env*.local`, so **`.env` is
committed**. Fine for these keys; do not put a real secret in that file.

## 4. Run locally against real Firestore

Copy the six values into `.env`:

```bash
cp .env.example .env    # then fill in the values
npm install
npm run dev             # http://localhost:3000
```

> **`.env` has no trailing newline.** If you append with `>>`, start the
> appended text with a newline or the first new key silently merges into
> `PORT=3002` and is never parsed.

To run the way production does, use the Express server instead:

```bash
npm run build
npm start               # http://localhost:3002
```

`npm start` serves the prebuilt `.next` output. If you ran `npm run dev`
afterwards, rebuild first — dev artifacts left in `.next` make a production
start fail with `jsxDEV is not a function`.

---

## 5. Test locally with the Firestore emulator

The emulator is a local Firestore that costs nothing, needs no project, and
**enforces `firestore.rules` exactly as production does**. Use it to check rule
changes before publishing them.

### Prerequisites

| Requirement | Note |
|---|---|
| **Java 11+** | The Firestore emulator is a Java process. `java -version` to check. |
| **Node 20+** | `firebase-tools` refuses to run on Node 18 (`incompatible with Node.js v18`). If your default is 18, switch: `nvm use 22`. |

`firebase-tools` is intentionally **not** a project dependency — it is large and
only needed for local testing. Install it once globally:

```bash
npm install -g firebase-tools
```

### Start the emulator

```bash
nvm use 22          # only if your default node is < 20
npm run emulator
```

That reads [`firebase.json`](./firebase.json) and starts Firestore on
**127.0.0.1:8080** with `firestore.rules` loaded, plus an inspection UI on
**<http://127.0.0.1:4000>** where you can browse documents.

The `--project demo-kedarnath` flag matters: a project id beginning with `demo-`
tells the SDK this is a fake project, so nothing ever reaches Google and no
credentials are required.

### Point the app at it

Add to `.env` (note the leading blank line, per the warning above):

```bash
printf '\nNEXT_PUBLIC_FIREBASE_API_KEY=demo-key\nNEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-kedarnath\nNEXT_PUBLIC_FIRESTORE_EMULATOR_HOST=127.0.0.1:8080\n' >> .env
```

Then, in a second terminal:

```bash
npm run build && npm start
```

`lib/firebase.js` calls `connectFirestoreEmulator` whenever
`NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST` is set, and talks to the real project when
it is not.

> `NEXT_PUBLIC_*` values are inlined **at build time**, not read at runtime.
> After changing any of them you must rebuild — restarting alone does nothing.

### Verify realtime actually works

Open <http://localhost:3002/reviews> and leave the tab alone. In a terminal,
write a review as if you were a different visitor:

```bash
curl -X POST \
  "http://127.0.0.1:8080/v1/projects/demo-kedarnath/databases/(default)/documents/reviews" \
  -H 'Content-Type: application/json' \
  -d '{"fields":{
        "name":{"stringValue":"Lakshmi Devi"},
        "description":{"stringValue":"Prasadam was served with great love."},
        "date":{"stringValue":"2026-09-18T10:00:00.000Z"}}}'
```

The review should appear in the untouched tab within a second or two. **No
reload.** That is the whole point of `onSnapshot`; if it does not appear, the
subscription is not working.

The URL must be quoted — `(default)` contains parentheses that bash would
otherwise interpret.

### Verify the rules block abuse

Each of these must return **403**. Grab a document id first:

```bash
BASE="http://127.0.0.1:8080/v1/projects/demo-kedarnath/databases/(default)/documents/reviews"
DOC=$(curl -s "$BASE" | grep -o '"name": "[^"]*reviews/[^"]*"' | head -1 | sed 's/.*reviews\///;s/"//')

# delete an existing review          -> 403
curl -s -o /dev/null -w '%{http_code}\n' -X DELETE "$BASE/$DOC"

# edit an existing review            -> 403
curl -s -o /dev/null -w '%{http_code}\n' -X PATCH "$BASE/$DOC" \
  -H 'Content-Type: application/json' \
  -d '{"fields":{"name":{"stringValue":"HACKED"},"description":{"stringValue":"z"},"date":{"stringValue":"2026-01-01"}}}'

# smuggle an extra field             -> 403
curl -s -o /dev/null -w '%{http_code}\n' -X POST "$BASE" \
  -H 'Content-Type: application/json' \
  -d '{"fields":{"name":{"stringValue":"X"},"description":{"stringValue":"Y"},"date":{"stringValue":"2026-01-01"},"isAdmin":{"booleanValue":true}}}'
```

A `200` on any of these means the rules did not publish correctly.

### When you are done

Stop the emulator with `Ctrl+C`. **Emulator data is in memory and is discarded
on exit** — that is intended, so every test run starts clean.

Before deploying, remove the three emulator lines from `.env`, or at minimum
`NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST`.

---

## 6. Deploy to Vercel

### `server.js` does not run on Vercel

Vercel runs `next build` and serves the output; the `start` script is ignored.
json-server, express-restify-mongoose and the MongoDB connection all disappear
in production. What that means:

| Feature | On Vercel |
|---|---|
| Reviews | **Works.** Pure Firestore, no server calls. |
| Home, About, Members, Donation, Login | **Work.** Static and client-only. |
| `/posts` | **Does not work.** It is the only page still calling `/api/v1` (`pages/posts.js`). It already returns 404 today because the json-server mount shadows those routes, so nothing that currently works is lost. The page shows its error state. |

Moving reviews to Firestore is what makes Vercel viable at all.

### Environment variables

Set the six `NEXT_PUBLIC_FIREBASE_*` values in
**Vercel → Project → Settings → Environment Variables**, ticked for Production,
Preview and Development. Dashboard values take precedence over a committed
`.env`.

Two things to get right:

1. **Never set `NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST` on Vercel.** Production
   would try to reach `127.0.0.1:8080` and every review would fail.
2. `MONGODB_URI` is not needed — nothing on Vercel uses it.

Because `NEXT_PUBLIC_*` is baked in at build time, **redeploy after changing any
variable**.

---

## 7. Deploy to Render + MongoDB Atlas (production)

**This is the production path.** Vercel (§6) runs `next build` only — `server.js`
never executes there, so admin login, the gallery/news APIs and `/admin` cannot
work. Render runs `npm start` → `NODE_ENV=production node server.js`, so the
whole portal — pages, APIs, admin portal, MongoDB — comes up unchanged, on a
free tier with no credit card.

### 7.1 MongoDB Atlas M0 cluster

At <https://cloud.mongodb.com> (free M0 — permanently free, 512 MB, no card):

1. **Build a Database → M0 Free**, cloud **AWS** / region **Mumbai
   (`ap-south-1`)** — matches the Render **Singapore** service below.
2. **Database Access → Add New Database User**: username of your choice (e.g.
   `kedar-admin`), password **Autogenerate and copy it now**, role
   **Read and write to any database**.
3. **Network Access → Add IP Address → Allow access from anywhere
   (`0.0.0.0/0`)** — Render's free tier has no static egress IPs, so a
   narrower allowlist cannot be maintained. TLS is mandatory either way.
4. **Database → Connect → Drivers (Node.js)**: copy the SRV connection string
   and fill in the two placeholders:

   ```text
   mongodb+srv://kedar-admin:<db-password>@kedarnath.xxxxx.mongodb.net/kedarnath?retryWrites=true&w=majority
   ```

   Replace `<db-password>` and set the path to `/kedarnath` so the collections
   land in a named database.

### 7.2 Generate the secrets

On any Linux/macOS machine (or WSL):

```bash
openssl rand -hex 32                      # ADMIN_SESSION_SECRET
openssl rand -base64 15 | tr '+/' '-_'    # ADMIN_PASSWORD (url-safe, 20 chars)
```

Treat the values like passwords: paste them into the Render dashboard and your
password manager, **never into the repo**. `.env` is committed and holds safe
defaults only; real host env vars (Render) always win over it by design.

> Rotating `ADMIN_SESSION_SECRET` instantly invalidates every session cookie —
> change it in the dashboard and restart if a session ever leaks.

### 7.3 Create the Render Web Service

1. Push the repo (with `render.yaml`) to GitHub.
2. **render.com → New + → Blueprint**, allow repo access, pick this repo.
   Render reads `render.yaml` and pre-fills everything below — you only paste
   the `sync: false` values.
3. Fill in:
   - `MONGODB_URI` — the Atlas SRV string from 7.1.
   - `ADMIN_USERNAME` — **not** `kedarnathadmin` (that pair lives in the public
     repo's login page code, so it is burned).
   - `ADMIN_PASSWORD` — from 7.2.
   - The six `NEXT_PUBLIC_FIREBASE_*` values — from the Firebase console (§3),
     same values as the Vercel project, and **never**
     `NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST`.
4. Apply. First build runs `npm install && npm run build` (~5 min), then
   `npm start` boots the Express+Next server on Render's injected `PORT`
   (`Server started on port 10000` in the log).
5. Optionally **Settings → Custom Domains** to attach your domain (free TLS).

### 7.4 First-deploy smoke test

Replace `https://<app>.onrender.com` with your Render URL. Run each command in
order (the cookie jar carries the session between steps):

```bash
curl -s https://<app>.onrender.com/api/v1/auth/session
curl -sc /tmp/k.jar -H 'Content-Type: application/json' \
  -d '{"username":"<admin-user>","password":"<admin-pass>"}' \
  https://<app>.onrender.com/api/v1/auth/login
curl -s -b /tmp/k.jar https://<app>.onrender.com/api/v1/auth/session
curl -s -o /dev/null -w '%{http_code}\n' https://<app>.onrender.com/gallery
curl -s -o /dev/null -w '%{http_code}\n' https://<app>.onrender.com/news
curl -s 'https://<app>.onrender.com/api/v1/gallery?limit=1'
curl -s -o /dev/null -w '%{http_code}\n' https://<app>.onrender.com/api/v1/reviews
```

Expect: session `{"isAdmin":false}`, login `{"ok":true,"isAdmin":true}`, the
next session call `{"isAdmin":true}`, gallery/news pages `200`, gallery API
list `200`, reviews `200`. Wrong credentials return `401`; the 6th failed
attempt within 15 min returns `429`.

### 7.5 Verify MongoDB is actually in use

In **Atlas → Browse Collections** (db `kedarnath`): `users` should appear with
the scrypt-hashed admin (the plaintext password is never stored). Collections
use the Mongoose-pluralized lowercase names — `users`, `posts`,
`galleryitems`, `newsarticles`. Querying `db.newsArticles` in mongosh
silently creates an empty namespace and misleads diagnosis.

In **Render → Logs**, boot should show `Server started on port 10000` and
**no** `[mongo] connect failed` warning. If Mongo is unreachable the server
still boots by design — pages stay up, writes return errors — so a silent
URI/allowlist mistake shows up as failed writes, not a dead site.

### 7.6 After the first deploy

- **Sleep/wake:** the free instance sleeps after ~15 min idle; the first
  visitor waits ~1 min. Mitigate with an external pinger (cron-job.org,
  every 10 min, GET `/api/v1/reviews`) if the wake is noticeable.
- **Backups:** M0 has none. If the gallery becomes a precious archive,
  `mongodump` periodically from an allowlisted machine, or upgrade the tier.
- **Scaling:** paid plans ($7/mo starter) remove sleep and add resources —
  nothing in the code needs to change.

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| "Reviews are not connected yet" | The six env vars are missing, or you changed them without rebuilding. `NEXT_PUBLIC_*` is inlined at build time. |
| Reviews never load, console shows `permission-denied` | `firestore.rules` was not published. Production mode denies reads until you do. |
| A new key in `.env` is ignored | `.env` has no trailing newline, so your appended line merged into the previous one. |
| `firebase: incompatible with Node.js v18` | `firebase-tools` needs Node 20+. `nvm use 22`. |
| Emulator will not start | Java missing, or port 8080 already in use. |
| Production start fails with `jsxDEV is not a function` | `.next` holds dev artifacts. `rm -rf .next && npm run build`. |
| Reviews work locally but not on Vercel | `NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST` is set in the Vercel dashboard. Remove it and redeploy. |
| `/posts` shows "Posts did not load" | Expected. See the Vercel table above. |
| Render deploy fails at `npm install` / `npm run build` | Open the build log; transient OOM on the 512 MB free plan → **Clear build cache & deploy** and retry. Persistent → compare Node version (`NODE_VERSION=22` is pinned in `render.yaml`). |
| Login works but gallery/news writes fail on Render | MongoDB is unreachable: check `MONGODB_URI` (password, `/kedarnath` path), and that Atlas **Network Access** allows `0.0.0.0/0`. The server intentionally stays up, so look for writes failing, not the site being down. |
| Site "down" on Render every so often | Free instances sleep after ~15 min idle and take ~1 min to wake. Expected; see §7.6 for the pinger mitigation. |

---

## Gallery & News admin (added 2026-09)

The public **Gallery** (`/gallery`) and **News** (`/news`) sections are managed
from `/admin` by the samithi admin. Storage is MongoDB — image binaries and
article text ride in the same database, compressed client-side (max 1920 px,
JPEG ~0.8 → typically 100–300 KB per photo), so the Atlas M0 free tier
(512 MB) holds thousands of photos at zero cost.

### Admin environment variables

```env
ADMIN_USERNAME=kedarnathadmin   # defaults to the historical login
ADMIN_PASSWORD=adminkedar3456   # override before deploying!
ADMIN_SESSION_SECRET=<openssl rand -hex 32>
```

**Where to put values.** `.env` is committed and holds safe defaults only —
never put a real password or secret in it. For anything real use `.env.local`
(git-ignored), which wins over `.env`, exactly like Next.js conventions:

| File | Committed? | Contents |
|---|---|---|
| `.env` | yes | safe defaults (local Mongo URI, port, historical demo creds) |
| `.env.local` | no | real secrets: production password, `openssl rand -hex 32` session secret |

Real environment variables on the host always win over both files. `node
server.js` (and therefore `npm start`) loads these files itself via the small
loader at the top of `server.js`; `KEDAR_SKIP_DOTENV=1` disables it.

The credentials are seeded as a **scrypt hash** into the `users` collection on
server boot — the plaintext never lives in the database. `ADMIN_PASSWORD`
changes are picked up and re-hashed at the next restart. Login is rate-limited
(5 attempts / 15 min / IP) and sets a signed HttpOnly session cookie (~12 h).

### Permissions

| Who | Gallery | News |
|---|---|---|
| Viewer (no login) | browse, filter, lightbox | read **published** articles only |
| Admin (`/login` → `/admin`) | upload / edit / delete | create / edit / publish / delete (drafts 404 publicly) |

All write endpoints re-check the session **server-side** (`401` without a valid
cookie) — the UI hiding controls is cosmetic, the API is the gate.

### Deployment caveats

- The gallery/news APIs and `/admin` require the **Node server** (`npm start`),
  like `/posts`. On Vercel (static export) the pages render but their APIs are
  unreachable — same accepted limitation as posts.
- Run against **MongoDB Atlas M0** in production: create a free cluster, whitelist
  your egress IP, and set `MONGODB_URI` to its connection string.
- Atlas M0 **pauses after 30 days of inactivity**; resume it with one click in
  the Atlas dashboard (data is retained).
- To swap a photo's image file, delete it and re-upload — stored binaries are
  immutable and cached (`Cache-Control: immutable`) under their object id.
