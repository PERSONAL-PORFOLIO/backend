const Testimonial = require('../models/Testimonial');

// GET /api/testimonials  (public — returns all, sorted)
const getAll = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: testimonials });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// POST /api/testimonials  (admin)
const create = async (req, res) => {
  try {
    const t = await Testimonial.create(req.body);
    res.status(201).json({ success: true, data: t });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

// PUT /api/testimonials/:id  (admin)
const update = async (req, res) => {
  try {
    const t = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!t) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: t });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

// DELETE /api/testimonials/:id  (admin)
const remove = async (req, res) => {
  try {
    const t = await Testimonial.findByIdAndDelete(req.params.id);
    if (!t) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

module.exports = { getAll, create, update, remove };
