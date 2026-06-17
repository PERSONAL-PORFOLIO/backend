const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth.middleware');
const {
  trackVisit, getOverview, getTimeline, getTopPages, getRecent,
} = require('../controllers/analytics.controller');

router.post('/track', trackVisit); // public — SPA page-view ping
router.get('/overview', protect, getOverview); // admin
router.get('/timeline', protect, getTimeline); // admin
router.get('/pages', protect, getTopPages); // admin
router.get('/recent', protect, getRecent); // admin

module.exports = router;
