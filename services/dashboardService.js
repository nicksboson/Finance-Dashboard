const Record = require('../models/Record');

const getSummary = async () => {
  // --- Pipeline 1: Income and Expense totals ---
  const totalsResult = await Record.aggregate([
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ]);

  let totalIncome = 0;
  let totalExpense = 0;

  totalsResult.forEach((entry) => {
    if (entry._id === 'income') totalIncome = entry.total;
    if (entry._id === 'expense') totalExpense = entry.total;
  });

  const netBalance = totalIncome - totalExpense;

  // --- Pipeline 2: Category-wise totals (grouped by type + category) ---
  const categoryTotals = await Record.aggregate([
    {
      $group: {
        _id: { type: '$type', category: '$category' },
        total: { $sum: '$amount' },
      },
    },
    {
      $project: {
        _id: 0,
        type: '$_id.type',
        category: '$_id.category',
        total: 1,
      },
    },
    { $sort: { type: 1, total: -1 } },
  ]);

  // --- Pipeline 3: Recent 5 transactions ---
  const recentTransactions = await Record.find({})
    .sort({ date: -1 })
    .limit(5)
    .select('amount type category date note');

  return {
    totalIncome,
    totalExpense,
    netBalance,
    categoryTotals,
    recentTransactions,
  };
};

module.exports = { getSummary };
