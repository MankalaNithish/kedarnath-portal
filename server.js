const express = require("express");
const next = require("next");
const restify = require("express-restify-mongoose");
const mongoose = require("mongoose");
const multer = require("multer");
const jsonServer = require('json-server');
const fs = require("fs");
const path = require("path");

// Env loader (zero new deps). node server.js does not read .env on its own;
// Next.js only does so inside its own pages/API routes. This makes .env work
// for every mode, including `npm start`:
//   - .env is COMMITTED and holds safe defaults only (see .gitignore);
//   - .env.local (git-ignored) wins over .env — the Next.js convention — and
//     is where real secrets belong on a developer machine;
//   - real environment variables always win over both, never overridden
//     (so a production host's injected secrets always take precedence);
//   - set KEDAR_SKIP_DOTENV=1 to disable entirely.
// Never put real passwords/keys in .env — commit those to .env.local only.
try {
  if (!process.env.KEDAR_SKIP_DOTENV) {
    for (const envFile of [".env.local", ".env"]) {
      const envPath = path.join(__dirname, envFile);
      if (!fs.existsSync(envPath)) continue;
      const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
      for (const line of lines) {
        const eq = line.indexOf("=");
        if (eq === -1 || line.startsWith("#")) continue;
        const key = line.slice(0, eq).trim();
        let value = line.slice(eq + 1).trim();
        // Strip one matching pair of surrounding quotes (dotenv-style).
        const quote = value[0];
        if ((quote === '"' || quote === "'") && value.endsWith(quote)) {
          value = value.slice(1, -1);
        }
        if (key && process.env[key] === undefined) process.env[key] = value;
      }
    }
  }
} catch (err) {
  // A malformed .env must never stop the server from booting.
  console.warn("[env] could not load .env files:", err.message);
}
const jsonRouter = jsonServer.router('db.json');

// Import your Mongoose models
const { User, Post } = require("./models");

// Gallery & News admin APIs. These mount BEFORE the legacy json-server mount:
// json-server's 404 handler ends the response chain, so anything registered
// after it under /api/v1 is unreachable. Mounting first leaves every existing
// endpoint (reviews, posts, users) behaving exactly as before.
const auth = require("./lib/server/auth");
const authRoutes = require("./lib/server/routes/auth");
const galleryRoutes = require("./lib/server/routes/gallery");
const newsRoutes = require("./lib/server/routes/news");

// Create a new Express app
const app = express();

app.use(express.json());

// Auth: /api/v1/auth/{login,logout,session}
app.use('/api/v1/auth', authRoutes);

// Gallery: multipart uploads (up to 10 images) + JSON edits.
const galleryUpload = multer({ storage: multer.memoryStorage() }).array('images', 10);
app.use('/api/v1/gallery', (req, res, next) => (
  req.method === 'POST' ? galleryUpload(req, res, next) : next()
), galleryRoutes.router);

// News: optional cover image on POST/PATCH (JSON-only edits skip multer).
const coverUpload = multer({ storage: multer.memoryStorage() }).single('cover');
app.use('/api/v1/news', (req, res, next) => (
  (req.method === 'POST' || req.method === 'PATCH') ? coverUpload(req, res, next) : next()
), newsRoutes.router);

app.use('/api/v1', jsonRouter);

mongoose.set('strictQuery', true);

// Connect to your MongoDB database. A failure (Atlas paused, wrong URI, local
// mongo down) must not kill the whole site: public pages and login keep
// working, gallery/news writes just return errors instead of a dead process.
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .catch(err =>
      console.warn('[mongo] connect failed — continuing without MongoDB:', err.message)
    );
}

// Seed/refresh the admin credentials (Gallery & News auth). Non-fatal when
// MongoDB is unreachable — the env hash still authenticates logins.
if (process.env.MONGODB_URI) auth.ensureAdminUser();

// Use express-restify-mongoose to create RESTful endpoints for your models
restify.serve(app, User, {name: 'users'});
restify.serve(app, Post, {name: 'posts'});

// Create a new Next.js app
const nextApp = next({ dev: process.env.NODE_ENV !== "production" });
const handle = nextApp.getRequestHandler();

// Configure multer to handle file uploads
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/v1/createPost', async (req, res) => {
    const uploadHandler = upload.array('images', 10);
    uploadHandler(req, res, async (err) => {
        if (err) {
            return res.status(400).json({error: err.message});
        }
        try {
            console.log(req.files);
            let images = req.files.map(x => {
                return {
                    data: x.buffer,
                    contentType: x.mimetype,
                    originalName: x.originalname
                }
            })
            let post = new Post({
                description: req.body.description,
                images
            });
            console.log(post);
            await post.save();
            return res.send({message: 'Post saved successfully'});
        } catch (err) {
            console.log(err.message);
            return res.status(500).json({error: 'Failed to upload image'});
        }
    });
});

// Define a route to handle all Next.js requests
app.all("*", (req, res) => {
  return handle(req, res);
});

// Start the server
let port = process.env.PORT || 3002;
nextApp.prepare().then(() => {
    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
})
