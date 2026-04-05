const userService = require('../services/userService');

const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    return res.status(201).json({ success: true, data: user });
  } catch (error) {
    // Mongoose duplicate key error for email
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

const getUserDirectory = async (req, res, next) => {
  try {
    const users = await userService.getUserDirectory();
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await userService.deleteUser(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createUser, updateUser, getUsers, getUserDirectory, deleteUser };
