const rbac = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user && req.user.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied: requires one of [${allowedRoles.join(', ')}] role`,
      });
    }

    next();
  };
};

module.exports = rbac;
