const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, default: '' },
  company: { type: String, default: '' },
  avatar: { type: String, default: '' },
  quote: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
