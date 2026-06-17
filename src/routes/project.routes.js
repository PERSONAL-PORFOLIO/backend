const express = require('express');
const router = express.Router();
const { getProjects, getProject, createProject, updateProject, deleteProject } = require('../controllers/project.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/', getProjects);
router.get('/:id', getProject);
router.post('/', protect, createProject);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);

module.exports = router;
