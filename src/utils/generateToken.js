const jwt = require('jsonwebtoken');

// Accept a full payload object (id, email, username, role)
// so the JWT is self-contained — no DB lookup needed on each request
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;
