const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  title: { type: String, required: true },
  summary: { type: String },
  avatar: { type: String },
  location: { type: String },
  email: { type: String },
  phone: { type: String },
  githubUrl: { type: String },
  linkedinUrl: { type: String },
  twitterUrl: { type: String },
  facebookUrl: { type: String },
  instagramUrl: { type: String },
  youtubeUrl: { type: String },
  websiteUrl: { type: String },
  resumeUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);
