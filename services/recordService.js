const Record = require('../models/Record');

const createRecord = async (data) => {
  const { amount, type, category, date, note } = data;
  const record = new Record({ amount, type, category, date, note });
  await record.save();
  return record;
};

const getRecords = async (filters = {}) => {
  const query = {};

  if (filters.type) {
    query.type = filters.type;
  }

  if (filters.category) {
    // Case-insensitive partial match on category
    query.category = { $regex: filters.category, $options: 'i' };
  }

  if (filters.date) {
    // Match all records on a specific calendar day regardless of time
    const start = new Date(filters.date);
    const end = new Date(filters.date);
    end.setUTCHours(23, 59, 59, 999);
    query.date = { $gte: start, $lte: end };
  }

  return Record.find(query).sort({ date: -1 });
};

const updateRecord = async (id, data) => {
  const allowedUpdates = ['amount', 'type', 'category', 'date', 'note'];
  const updateData = {};

  allowedUpdates.forEach((field) => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  return Record.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

const deleteRecord = async (id) => {
  return Record.findByIdAndDelete(id);
};

module.exports = { createRecord, getRecords, updateRecord, deleteRecord };
