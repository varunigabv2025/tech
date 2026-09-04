const jwt = require('jsonwebtoken');
const db = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'trustflow_jwt_secret_key_2026_secure_demo';
const COOKIE_NAME = 'trustflow_token';

function getCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  const secureEnv = process.env.COOKIE_SECURE;
  const secure = secureEnv !== undefined ? secureEnv === 'true' : isProd;
  return {
    httpOnly: true,
    secure: secure,
    sameSite: process.env.COOKIE_SAME_SITE || 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
  };
}

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      unitId: user.unit_id || user.unitId || null
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function sanitizeUser(userRow) {
  if (!userRow) return null;
  return {
    id: userRow.id,
    name: userRow.name,
    email: userRow.email,
    role: userRow.role,
    unitId: userRow.unit_id || userRow.unitId || null,
    createdAt: userRow.created_at || userRow.createdAt,
    updatedAt: userRow.updated_at || userRow.updatedAt
  };
}

function authenticateToken(req, res, next) {
  let token = null;

  // Preferred authentication source: HttpOnly cookie
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    token = req.cookies[COOKIE_NAME];
  }

  // Fallback / legacy authentication source: Authorization or x-access-token header
  if (!token) {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.headers['x-access-token']) {
      token = String(req.headers['x-access-token']).trim();
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token required. Please sign in.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);

    if (!userRow) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Authenticated user no longer exists.'
      });
    }

    req.user = sanitizeUser(userRow);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.'
    });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role '${req.user.role}' is not authorized to access this resource. Required role(s): ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}

function optionalAuth(req, res, next) {
  let token = null;

  if (req.cookies && req.cookies[COOKIE_NAME]) {
    token = req.cookies[COOKIE_NAME];
  }

  if (!token) {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (req.headers['x-access-token']) {
      token = String(req.headers['x-access-token']).trim();
    }
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);
      if (userRow) {
        req.user = sanitizeUser(userRow);
      }
    } catch {
      // Non-blocking optional token parsing
    }
  }
  next();
}

function assertUnitOwnership(req, targetUnitId) {
  if (req.user && req.user.role === 'MSME' && req.user.unitId) {
    if (req.user.unitId !== targetUnitId) {
      const err = new Error('Access denied. Resource belongs to a different unit.');
      err.statusCode = 403;
      err.code = 'UNIT_ACCESS_DENIED';
      throw err;
    }
  }
  return true;
}

module.exports = {
  generateToken,
  sanitizeUser,
  authenticateToken,
  optionalAuth,
  requireRole,
  assertUnitOwnership,
  JWT_SECRET,
  COOKIE_NAME,
  getCookieOptions
};

