const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');

router.get(
  '/summary',
  auth,
  rbac('admin', 'analyst'),
  dashboardController.getSummary
);

module.exports = router;
