const jwt = require('jsonwebtoken');
const { findUserById, findOrgById } = require('../services/dataStore');

const JWT_SECRET = process.env.JWT_SECRET || 'stockflow_super_secret_jwt_key_2026_dev';

// verifies the jwt token and loads the user + organization info onto req
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    let decoded;

    // verify token signature and expiration
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }

    // check if user still exists in db
    const user = await findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found. Please log in again.' });
    }

    // fetch organization name to show in the UI header/sidebar
    const organization = await findOrgById(user.organizationId);

    // attach user and organization context so routes can filter by orgId
    req.user = {
      _id: user._id.toString(),
      email: user.email,
      organizationId: user.organizationId.toString(),
      organizationName: organization ? organization.name : 'Unknown Organization',
    };
    req.userId = req.user._id;
    req.organizationId = req.user.organizationId;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Internal server authentication error' });
  }
};

module.exports = {
  requireAuth,
  JWT_SECRET,
};
