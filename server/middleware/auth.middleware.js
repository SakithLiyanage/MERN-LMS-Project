const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Protect routes - verifies JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if token is in the Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Get token from header - format: "Bearer tokenstring"
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    console.log('Token decoded, user id:', decoded.id);

    // Get user from token
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('User not found for token');
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    // Set user in request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user?.role || 'unknown'} is unauthorized`,
      });
    }
    next();
  };
};

