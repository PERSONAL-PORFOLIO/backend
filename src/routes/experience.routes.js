const express = require('express');
const router = express.Router();
const { getExperiences, createExperience, updateExperience, deleteExperience } = require('../controllers/experience.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/', getExperiences);
router.post('/', protect, createExperience);
router.put('/:id', protect, updateExperience);
router.delete('/:id', protect, deleteExperience);

module.exports = router;
