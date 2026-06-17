const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/profile.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/', getProfile);
router.put('/', protect, updateProfile);

module.exports = router;
