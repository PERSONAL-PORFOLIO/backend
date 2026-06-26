const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { chat } = require('../controllers/ai.controller');

const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again in an hour.' },
});

router.post('/chat', aiLimiter, chat);

module.exports = router;
