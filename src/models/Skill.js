const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: Number, min: 0, max: 100, default: 80 },
  category: {
    type: String,
    enum: ['Frontend', 'Backend', 'Database', 'Mobile', 'DevOps', 'Other'],
    default: 'Other',
  },
  icon: { type: String }, // emoji fallback
  iconUrl: { type: String }, // uploaded image/SVG URL
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);
