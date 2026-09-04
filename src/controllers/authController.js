const bcrypt = require('bcryptjs');
const db = require('../db/database');
const { generateToken, sanitizeUser, COOKIE_NAME, getCookieOptions } = require('../middleware/authMiddleware');

function validateEmail(email) {
  if (typeof email !== 'string') return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

function nextUserId() {
  const row = db.prepare('SELECT COUNT(*) as count FROM users').get();
  const count = (row ? row.count : 0) + 1;
  return `USR${String(count).padStart(3, '0')}`;
}

function register(req, res) {
  try {
    const { name, email, password, role, unitId } = req.body || {};

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required'
      });
    }

    const trimmedName = String(name).trim();
    const cleanEmail = String(email).toLowerCase().trim();
    const cleanRole = String(role).trim().toUpperCase();

    if (!validateEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address format'
      });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    if (cleanRole !== 'MSME' && cleanRole !== 'FINANCIER') {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Role must be either 'MSME' or 'FINANCIER'"
      });
    }

    // Check duplicate email
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists'
      });
    }

    // Validate unitId if provided for MSME role
    let assignedUnitId = unitId || null;
    if (assignedUnitId) {
      const unit = db.prepare('SELECT id FROM units WHERE id = ?').get(assignedUnitId);
      if (!unit) {
        return res.status(400).json({
          success: false,
          message: `Associated unit '${assignedUnitId}' not found`
        });
      }
    }

    const userId = nextUserId();
    const saltRounds = 10;
    const passwordHash = bcrypt.hashSync(password, saltRounds);
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, unit_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, trimmedName, cleanEmail, passwordHash, cleanRole, assignedUnitId, now, now);

    const newUser = sanitizeUser(
      db.prepare('SELECT * FROM users WHERE id = ?').get(userId)
    );

    const token = generateToken(newUser);

    // Set JWT in HttpOnly cookie
    res.cookie(COOKIE_NAME, token, getCookieOptions());

    return res.status(201).json({
      success: true,
      message: 'User account registered successfully',
      user: newUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register user account'
    });
  }
}

function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const userRow = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);

    if (!userRow) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const passwordMatches = bcrypt.compareSync(password, userRow.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = sanitizeUser(userRow);
    const token = generateToken(user);

    // Set JWT in HttpOnly cookie
    res.cookie(COOKIE_NAME, token, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to authenticate user'
    });
  }
}

function logout(req, res) {
  const options = getCookieOptions();
  res.clearCookie(COOKIE_NAME, options);
  res.cookie(COOKIE_NAME, '', { ...options, maxAge: 0 });

  return res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
}

function getMe(req, res) {
  return res.status(200).json({
    success: true,
    user: req.user
  });
}

module.exports = {
  register,
  login,
  logout,
  getMe
};

