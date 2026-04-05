const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const { validateUser } = require('../middleware/validate');

router.get('/directory', userController.getUserDirectory);

router.post(
  '/',
  auth,
  rbac('admin'),
  validateUser,
  userController.createUser
);

router.get(
  '/',
  auth,
  rbac('admin', 'analyst', 'viewer'),
  userController.getUsers
);

router.patch(
  '/:id',
  auth,
  rbac('admin'),
  validateUser,
  userController.updateUser
);

router.delete(
  '/:id',
  auth,
  rbac('admin'),
  userController.deleteUser
);

module.exports = router;
