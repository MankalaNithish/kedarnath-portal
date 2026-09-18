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
