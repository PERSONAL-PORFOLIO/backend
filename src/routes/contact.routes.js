const express = require('express');
const router = express.Router();
const { submitContact, getContacts, markRead, deleteContact, getUnreadCount } = require('../controllers/contact.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/', submitContact);
router.get('/unread-count', protect, getUnreadCount);
router.get('/', protect, getContacts);
router.patch('/:id/read', protect, markRead);
router.delete('/:id', protect, deleteContact);

module.exports = router;
