const express = require('express');
const router = express.Router();
const { getPublicSettings, getAdminSettings, updateSettings } = require('../controllers/settings.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/', getPublicSettings); // public
router.get('/admin', protect, getAdminSettings); // protected
router.put('/', protect, updateSettings); // protected

module.exports = router;
