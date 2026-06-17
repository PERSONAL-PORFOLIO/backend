const Settings = require('../models/Settings');

const getOrCreate = async () => {
  let s = await Settings.findOne();
  if (!s) s = await Settings.create({});
  return s;
};

// GET /api/settings  (public)
const getPublicSettings = async (req, res) => {
  try {
    const settings = await getOrCreate();
    const data = settings.toObject();
    delete data.notificationEmail;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/settings/admin  (protected)
const getAdminSettings = async (req, res) => {
  try {
    const settings = await getOrCreate();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/settings  (protected)
const updateSettings = async (req, res) => {
  try {
    const settings = await getOrCreate();
    const body = { ...req.body };

    // Merge nested navVisibility
    if (body.navVisibility) {
      settings.navVisibility = {
        ...(settings.navVisibility?.toObject?.() ?? settings.navVisibility),
        ...body.navVisibility,
      };
      delete body.navVisibility;
    }

    // Merge nested pageSeo (deep merge each page key)
    if (body.pageSeo) {
      const existing = settings.pageSeo?.toObject?.() ?? settings.pageSeo ?? {};
      const merged = { ...existing };
      for (const [page, seo] of Object.entries(body.pageSeo)) {
        merged[page] = { ...(existing[page] ?? {}), ...seo };
      }
      settings.pageSeo = merged;
      delete body.pageSeo;
    }

    Object.assign(settings, body);
    await settings.save();

    res.json({ success: true, data: settings, message: 'Settings saved' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getPublicSettings, getAdminSettings, updateSettings };
