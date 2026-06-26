const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/testimonial.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/', getAll);
router.post('/', protect, create);
router.put('/:id', protect, update);
router.delete('/:id', protect, remove);

module.exports = router;
