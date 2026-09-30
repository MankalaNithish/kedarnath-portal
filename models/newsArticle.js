const mongoose = require('mongoose');
const { Schema }  = mongoose;

/**
 * One news article. Drafts (published: false) are invisible to viewers at the
 * API level — list and detail endpoints filter them out unless the request
 * carries a valid admin session. The cover image follows the same Buffer
 * subdocument pattern as models/post.js and models/galleryItem.js.
 */
const newsArticleSchema = new Schema({
    title: {type: 'String', required: true, trim: true},
    slug: {type: 'String', required: true, unique: true, lowercase: true, trim: true},
    summary: {type: 'String', default: ''},
    content: {type: 'String', required: true, default: ''},
    category: {type: 'String', default: ''},
    published: {type: 'Boolean', default: false},
    publishedAt: {type: Date},
    coverImage: {
        data: Buffer,
        contentType: String,
        originalName: String,
        size: Number
    },
    createdBy: {type: mongoose.Types.ObjectId, ref: 'User'}
}, { timestamps: true });

// Public feeds read the newest published articles first.
newsArticleSchema.index({ published: 1, publishedAt: -1 });
newsArticleSchema.index({ category: 1 });

const NewsArticle = mongoose.model('NewsArticle', newsArticleSchema);

module.exports = NewsArticle;
