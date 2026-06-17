const Experience = require('../models/Experience');

const getExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find().sort({ order: 1, startDate: -1 });
    res.json({ success: true, data: experiences });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createExperience = async (req, res) => {
  try {
    const experience = await Experience.create(req.body);
    res.status(201).json({ success: true, data: experience });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateExperience = async (req, res) => {
  try {
    const experience = await Experience.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!experience) return res.status(404).json({ success: false, message: 'Experience not found' });
    res.json({ success: true, data: experience });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteExperience = async (req, res) => {
  try {
    const experience = await Experience.findByIdAndDelete(req.params.id);
    if (!experience) return res.status(404).json({ success: false, message: 'Experience not found' });
    res.json({ success: true, message: 'Experience deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getExperiences, createExperience, updateExperience, deleteExperience };
