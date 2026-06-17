const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  page: { type: String, required: true }, // e.g. '/about', '/projects'
  ip: { type: String, default: 'unknown' },
  userAgent: { type: String, default: '' },
  referer: { type: String, default: '' },
}, { timestamps: true });

// Index for fast aggregation queries
visitSchema.index({ createdAt: -1 });
visitSchema.index({ page: 1 });

module.exports = mongoose.model('Visit', visitSchema);
