const Profile = require('../models/Profile');

// GET /api/profile
const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne();
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/profile
const updateProfile = async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (profile) {
      profile = await Profile.findByIdAndUpdate(profile._id, req.body, { new: true, runValidators: true });
    } else {
      profile = await Profile.create(req.body);
    }
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProfile, updateProfile };
