const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  position: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date }, // null = present
  technologies: [{ type: String }],
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Experience', experienceSchema);
