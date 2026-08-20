const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware to protect routes that require authentication
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token, authorization denied' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Find user by ID from token - using userId instead of user.id
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token is not valid' 
      });
    }

    // Add user to request object
    req.user = user;
    req.userId = user.id;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ 
      success: false, 
      message: 'Token is not valid',
      error: err.message 
    });
  }
};

// Middleware to check if user is admin
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Not authorized as an admin' 
    });
  }
};

module.exports = { auth, admin };
