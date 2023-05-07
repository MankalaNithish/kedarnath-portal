const express = require("express");
const next = require("next");
const restify = require("express-restify-mongoose");
const mongoose = require("mongoose");
const multer = require("multer");
const jsonServer = require('json-server');
const jsonRouter = jsonServer.router('db.json');

// Import your Mongoose models
const { User, Post } = require("./models");

// Create a new Express app
const app = express();
app.use('/api', jsonRouter);

// Connect to your MongoDB database
if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
}
mongoose.set('strictQuery', true);

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
