const mongoose = require('mongoose');
const { Schema }  = mongoose;

const postSchema = new Schema({
    title: {type: 'String', default: 'Kedarnath Annadana Seva Samithi'},
    date: {type: Date},
    description: {type: 'String'},
    lastUpdatedAt: {type: Date},
    images: [{
        data: Buffer,
        contentType: String,
        originalName: String
    }],
    postedBy: {type: mongoose.Types.ObjectId, ref: 'User'}
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;