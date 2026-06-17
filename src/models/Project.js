const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String }, // cover/screenshot image
  logo: { type: String }, // small project logo/icon URL
  githubUrl: { type: String },
  demoUrl: { type: String },
  technologies: [{ type: String }],
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
