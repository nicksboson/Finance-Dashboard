const express = require('express');
const router = express.Router();

const recordController = require('../controllers/recordController');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const { validateRecord } = require('../middleware/validate');

router.post(
  '/',
  auth,
  rbac('admin', 'analyst'),
  validateRecord,
  recordController.createRecord
);

router.get(
  '/',
  auth,
  rbac('admin', 'analyst', 'viewer'),
  recordController.getRecords
);

router.patch(
  '/:id',
  auth,
  rbac('admin', 'analyst'),
  validateRecord,
  recordController.updateRecord
);

router.delete(
  '/:id',
  auth,
  rbac('admin'),
  recordController.deleteRecord
);

module.exports = router;
