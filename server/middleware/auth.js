const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if subscription has expired
    if (user.subscription.isActive && user.subscription.endDate < new Date()) {
      user.subscription.isActive = false;
      user.subscription.plan = 'none';
      user.role = 'free';
      await user.save();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

const requirePremium = (req, res, next) => {
  if (req.user.role !== 'premium' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Premium subscription required' });
  }
  next();
};

module.exports = { auth, requireRole, requirePremium };
