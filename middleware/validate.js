const validateUser = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const method = req.method;

  // On creation, all required fields must be present
  if (method === 'POST') {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Validation error: name is required and must be a non-empty string',
      });
    }

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: a valid email address is required',
      });
    }

    if (!password || typeof password !== 'string' || password.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Validation error: password is required',
      });
    }

    if (!role || !['viewer', 'analyst', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: role must be one of viewer, analyst, admin',
      });
    }
  }

  // On update, validate only fields that are present
  if (method === 'PATCH') {
    if (email !== undefined && !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: a valid email address is required',
      });
    }

    if (role !== undefined && !['viewer', 'analyst', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: role must be one of viewer, analyst, admin',
      });
    }

    const status = req.body.status;
    if (status !== undefined && !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: status must be one of active, inactive',
      });
    }
  }

  next();
};

const validateRecord = (req, res, next) => {
  const { amount, type, category, date } = req.body;
  const method = req.method;

  if (method === 'POST') {
    if (amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: amount is required',
      });
    }

    if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: amount must be a non-negative number',
      });
    }

    if (!type || !['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: type must be either income or expense',
      });
    }

    if (!category || typeof category !== 'string' || category.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Validation error: category is required and must be a non-empty string',
      });
    }

    if (!date || !isValidDate(date)) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: a valid date is required (e.g. YYYY-MM-DD)',
      });
    }
  }

  if (method === 'PATCH') {
    if (amount !== undefined && (typeof amount !== 'number' || isNaN(amount) || amount < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: amount must be a non-negative number',
      });
    }

    if (type !== undefined && !['income', 'expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: type must be either income or expense',
      });
    }

    if (date !== undefined && !isValidDate(date)) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: a valid date is required (e.g. YYYY-MM-DD)',
      });
    }
  }

  next();
};

// --- Helpers ---

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidDate = (value) => {
  const date = new Date(value);
  return !isNaN(date.getTime());
};

module.exports = { validateUser, validateRecord };
