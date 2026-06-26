const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  excerpt: { type: String, default: '' }, // short summary shown in listing
  content: { type: String, default: '' }, // full HTML/Markdown body
  coverImage: { type: String, default: '' }, // URL
  tags: [{ type: String, trim: true }],
  published: { type: Boolean, default: false },
  publishedAt: { type: Date },
  readTime: { type: Number, default: 1 }, // estimated minutes, auto-calculated
  views: { type: Number, default: 0 },
}, { timestamps: true });

// Auto-calculate read time and publishedAt before save
postSchema.pre('save', function(next) {
  if (this.content) {
    const words = this.content.replace(/<[^>]+>/g, '').split(/\s+/).length;
    this.readTime = Math.max(1, Math.ceil(words / 200));
  }
  if (this.published && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  if (!this.published) {
    this.publishedAt = undefined;
  }
  next();
});

module.exports = mongoose.model('Post', postSchema);
