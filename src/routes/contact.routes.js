const express = require('express');
const router = express.Router();
const { submitContact, getContacts, markRead, deleteContact, getUnreadCount, replyToContact } = require('../controllers/contact.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/', submitContact);
router.get('/unread-count', protect, getUnreadCount);
router.get('/', protect, getContacts);
router.patch('/:id/read', protect, markRead);
router.post('/:id/reply', protect, replyToContact);
router.delete('/:id', protect, deleteContact);

module.exports = router;
