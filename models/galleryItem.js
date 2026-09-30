const mongoose = require('mongoose');
const { Schema }  = mongoose;

/**
 * One photograph in the camp gallery. The binary rides inside the document
 * (same pattern as models/post.js) and is served by GET /api/v1/gallery/:id/image,
 * so list endpoints exclude image.data and stay light.
 */
const galleryItemSchema = new Schema({
    title: {type: 'String', default: ''},
    caption: {type: 'String', default: ''},
    description: {type: 'String', default: ''},
    category: {type: 'String', default: ''},
    displayOrder: {type: 'Number', default: 0},
    image: {
        data: Buffer,
        contentType: String,
        originalName: String,
        size: Number
    },
    createdBy: {type: mongoose.Types.ObjectId, ref: 'User'}
}, { timestamps: true });

// Gallery reads sort by display order, then newest first.
galleryItemSchema.index({ displayOrder: 1, createdAt: -1 });
galleryItemSchema.index({ category: 1 });

const GalleryItem = mongoose.model('GalleryItem', galleryItemSchema);

module.exports = GalleryItem;
