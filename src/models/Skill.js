const mongoose = require('mongoose');

const CATEGORIES = ['Frontend', 'Backend', 'Database', 'Mobile', 'DevOps', 'Other'];

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: Number, min: 0, max: 100, default: 80 },
  // Multi-category: one skill can belong to several categories
  categories: {
    type: [{ type: String, enum: CATEGORIES }],
    default: ['Other'],
    validate: {
      validator: (v) => Array.isArray(v) && v.length > 0,
      message: 'At least one category is required',
    },
  },
  // Kept for backward compatibility — populated from categories[0] on read if missing
  category: { type: String },
  icon: { type: String },
  iconUrl: { type: String },
  order: { type: Number, default: 0 },
}, { timestamps: true });

// Auto-fill legacy category field so old code reading .category still works
skillSchema.pre('save', function(next) {
  if (this.categories?.length) this.category = this.categories[0];
  next();
});

module.exports = mongoose.model('Skill', skillSchema);
