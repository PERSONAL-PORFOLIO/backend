const express = require('express');
const router = express.Router();
const { getAll, getOne, getAdmin, create, update, remove } = require('../controllers/post.controller');
const { protect } = require('../middlewares/auth.middleware');

// Public
router.get('/', getAll);
router.get('/admin/all', protect, getAdmin);
router.get('/:slug', getOne);

// Admin
router.post('/', protect, create);
router.put('/:id', protect, update);
router.delete('/:id', protect, remove);

module.exports = router;
