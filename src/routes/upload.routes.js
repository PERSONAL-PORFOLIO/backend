const express = require('express');
const router = express.Router();
const upload = require('../utils/upload');
const { protect } = require('../middlewares/auth.middleware');

// POST /api/upload  (admin only)
router.post('/', protect, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  res.json({
    success: true,
    url: req.file.path, // Cloudinary HTTPS URL
    filename: req.file.filename,
    originalname: req.file.originalname,
    size: req.file.size,
  });
});

module.exports = router;
