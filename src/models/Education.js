const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  school: { type: String, required: true },
  degree: { type: String, required: true },
  field: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Education', educationSchema);
