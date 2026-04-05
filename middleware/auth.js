const User = require('../models/User');

const auth = async (req, res, next) => {
  const userId = req.headers['x-user-id'];

  if (!userId) {
    try {
      // Bootstrap bypass: if no users exist in the system, allow the request to proceed as an admin
      // This solves the 'chicken and egg' problem of creating the very first user.
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        req.user = { role: 'admin', status: 'active' };
        return next();
      }
    } catch (err) {
      // Ignored, fall out to the 403 below
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied: x-user-id header is required',
    });
  }

  try {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: user not found',
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: user account is inactive',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    // Handles malformed MongoDB ObjectId
    return res.status(403).json({
      success: false,
      message: 'Access denied: invalid user ID format',
    });
  }
};

module.exports = auth;
