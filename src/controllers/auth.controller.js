const crypto = require('crypto');
const generateToken = require('../utils/generateToken');

// Constant-time comparison — prevents timing-based attacks
const safeEqual = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

// POST /api/auth/login
// Credentials are read from env vars — never stored in the database.
// Set OWNERLOGIN (any string: email, username, etc.), ADMIN_PASSWORD,
// and optionally ADMIN_USERNAME on Render.
const login = async (req, res) => {
  try {
    const { login: loginInput, password } = req.body;

    if (!loginInput || !password) {
      return res.status(400).json({ success: false, message: 'Login and password are required' });
    }

    const ownerLogin = process.env.OWNERLOGIN;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!ownerLogin || !adminPassword) {
      console.error('[auth] OWNERLOGIN or ADMIN_PASSWORD is not set in environment');
      return res.status(500).json({ success: false, message: 'Server credentials not configured' });
    }

    // OWNERLOGIN can be any string — email, username, or anything
    const loginOk = safeEqual(loginInput.trim().toLowerCase(), ownerLogin.trim().toLowerCase());
    const passOk = safeEqual(password, adminPassword);

    if (!loginOk || !passOk) {
      return res.status(401).json({ success: false, message: 'Invalid login or password' });
    }

    const adminUser = {
      id: 'admin',
      username: process.env.ADMIN_USERNAME || 'admin',
      email: ownerLogin,
      role: 'admin',
    };

    const token = generateToken(adminUser);

    res.json({ success: true, token, user: adminUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = { login, getMe };
