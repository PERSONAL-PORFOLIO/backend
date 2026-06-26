const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  message: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
}, { _id: false });

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  replies: { type: [replySchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
