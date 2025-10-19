const Expense = require('../models/Expense');

const createExpense = async (req, res) => {
  try {
    const data = { ...req.body, user: req.userId };
    const e = await Expense.create(data);
    res.json(e);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.userId }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateExpense = async (req, res) => {
  try {
    const e = await Expense.findOneAndUpdate({ _id: req.params.id, user: req.userId }, req.body, { new: true });
    res.json(e);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const deleteExpense = async (req, res) => {
  try {
    await Expense.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { createExpense, getExpenses, updateExpense, deleteExpense };
