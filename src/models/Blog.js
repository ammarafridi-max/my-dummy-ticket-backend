const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'A blog post must have a title'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'A blog post must have a slug'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'A blog post must have content'],
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    coverImageUrl: {
      type: String,
      required: [true, 'A blog post must have a cover image'],
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    tags: [String],
    metaTitle: String,
    metaDescription: String,
    author: String,
    readingTime: Number,
    publishedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);
