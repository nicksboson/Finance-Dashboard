const User = require('../models/User');

const createUser = async (data) => {
  const { name, email, password, role, status } = data;

  const user = new User({ name, email, password, role, status });
  await user.save();

  // Return user without password field
  const result = user.toObject();
  delete result.password;
  return result;
};

const updateUser = async (id, data) => {
  const allowedUpdates = ['name', 'email', 'role', 'status'];
  const updateData = {};

  allowedUpdates.forEach((field) => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,           // return the updated document
    runValidators: true, // enforce schema validation on update
    select: '-password', // exclude password from result
  });

  return user;
};

const getAllUsers = async () => {
  return User.find({}).select('-password').sort({ createdAt: -1 });
};

const getUserDirectory = async () => {
  return User.find({ status: 'active' })
    .select('name role status')
    .sort({ createdAt: 1 });
};

const deleteUser = async (id) => {
  return User.findByIdAndDelete(id);
};

module.exports = { createUser, updateUser, getAllUsers, getUserDirectory, deleteUser };
