const Certificate = require('../models/Certificate');

const getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({ order: 1, issueDate: -1 });
    res.json({ success: true, data: certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.create(req.body);
    res.status(201).json({ success: true, data: certificate });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!certificate) return res.status(404).json({ success: false, message: 'Certificate not found' });
    res.json({ success: true, data: certificate });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findByIdAndDelete(req.params.id);
    if (!certificate) return res.status(404).json({ success: false, message: 'Certificate not found' });
    res.json({ success: true, message: 'Certificate deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCertificates, createCertificate, updateCertificate, deleteCertificate };
