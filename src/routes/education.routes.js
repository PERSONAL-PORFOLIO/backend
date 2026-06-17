const express = require('express');
const router = express.Router();
const { getEducations, createEducation, updateEducation, deleteEducation } = require('../controllers/education.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/', getEducations);
router.post('/', protect, createEducation);
router.put('/:id', protect, updateEducation);
router.delete('/:id', protect, deleteEducation);

module.exports = router;
