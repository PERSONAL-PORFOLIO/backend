const Education = require('../models/Education');

const getEducations = async (req, res) => {
  try {
    const educations = await Education.find().sort({ order: 1, startDate: -1 });
    res.json({ success: true, data: educations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createEducation = async (req, res) => {
  try {
    const education = await Education.create(req.body);
    res.status(201).json({ success: true, data: education });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateEducation = async (req, res) => {
  try {
    const education = await Education.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!education) return res.status(404).json({ success: false, message: 'Education not found' });
    res.json({ success: true, data: education });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteEducation = async (req, res) => {
  try {
    const education = await Education.findByIdAndDelete(req.params.id);
    if (!education) return res.status(404).json({ success: false, message: 'Education not found' });
    res.json({ success: true, message: 'Education deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getEducations, createEducation, updateEducation, deleteEducation };
