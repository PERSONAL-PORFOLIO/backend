const Visit = require('../models/Visit');

/* ── Helper: strip IPv6 prefix so "::ffff:1.2.3.4" → "1.2.3.4" ── */
const normalizeIp = (raw = '') =>
  raw.replace(/^::ffff:/, '').split(',')[0].trim() || 'unknown';

/* ════════════════════════════════════════════════════════════════
   POST /api/analytics/track   (public — called by frontend SPA)
════════════════════════════════════════════════════════════════ */
const trackVisit = async (req, res) => {
  try {
    const { page } = req.body;
    if (!page) return res.status(400).json({ success: false });

    // Skip admin panel routes
    if (page.startsWith('/admin')) return res.json({ success: true });

    const ip = normalizeIp(
      req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
    );

    await Visit.create({
      page,
      ip,
      userAgent: req.headers['user-agent'] || '',
      referer: req.headers['referer'] || '',
    });

    res.json({ success: true });
  } catch (err) {
    // Silent — never break the frontend for an analytics error
    res.json({ success: false });
  }
};

/* ════════════════════════════════════════════════════════════════
   GET /api/analytics/overview  (admin)
   Returns headline stats
════════════════════════════════════════════════════════════════ */
const getOverview = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const week = new Date(today); week.setDate(today.getDate() - 6);
    const month = new Date(today); month.setDate(today.getDate() - 29);

    const [total, todayCount, weekCount, monthCount, uniqueIps] = await Promise.all([
      Visit.countDocuments(),
      Visit.countDocuments({ createdAt: { $gte: today } }),
      Visit.countDocuments({ createdAt: { $gte: week } }),
      Visit.countDocuments({ createdAt: { $gte: month } }),
      Visit.distinct('ip', { ip: { $ne: 'unknown' } }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        today: todayCount,
        week: weekCount,
        month: monthCount,
        uniqueVisitors: uniqueIps.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ════════════════════════════════════════════════════════════════
   GET /api/analytics/timeline?days=30  (admin)
   Returns daily visit counts for the last N days
════════════════════════════════════════════════════════════════ */
const getTimeline = async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days || '30', 10), 90);
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);

    const raw = await Visit.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            y: { $year: '$createdAt' },
            m: { $month: '$createdAt' },
            d: { $dayOfMonth: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1 } },
    ]);

    // Build a full date-keyed map so missing days show as 0
    const map = {};
    raw.forEach(({ _id, count }) => {
      const key = `${_id.y}-${String(_id.m).padStart(2, '0')}-${String(_id.d).padStart(2, '0')}`;
      map[key] = count;
    });

    const timeline = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      timeline.push({ date: key, visits: map[key] || 0 });
    }

    res.json({ success: true, data: timeline });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ════════════════════════════════════════════════════════════════
   GET /api/analytics/pages?limit=10  (admin)
   Returns top pages by visit count
════════════════════════════════════════════════════════════════ */
const getTopPages = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 50);

    const data = await Visit.aggregate([
      { $group: { _id: '$page', visits: { $sum: 1 } } },
      { $sort: { visits: -1 } },
      { $limit: limit },
      { $project: { _id: 0, page: '$_id', visits: 1 } },
    ]);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ════════════════════════════════════════════════════════════════
   GET /api/analytics/recent?limit=20  (admin)
   Returns most recent raw visits
════════════════════════════════════════════════════════════════ */
const getRecent = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 100);
    const data = await Visit.find().sort({ createdAt: -1 }).limit(limit).lean();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { trackVisit, getOverview, getTimeline, getTopPages, getRecent };
