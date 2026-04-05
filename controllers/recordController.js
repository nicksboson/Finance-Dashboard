const recordService = require('../services/recordService');

const createRecord = async (req, res, next) => {
  try {
    const record = await recordService.createRecord(req.body);
    return res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

const getRecords = async (req, res, next) => {
  try {
    const { type, category, date } = req.query;
    const records = await recordService.getRecords({ type, category, date });
    return res.status(200).json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};

const updateRecord = async (req, res, next) => {
  try {
    const record = await recordService.updateRecord(req.params.id, req.body);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
      });
    }

    return res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

const deleteRecord = async (req, res, next) => {
  try {
    const record = await recordService.deleteRecord(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Record deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRecord, getRecords, updateRecord, deleteRecord };
