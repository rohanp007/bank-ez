const express = require('express');
const router = express.Router();
const { pool } = require('../models/database'); // Ensure you import your database connection

// Deposit Money Route
router.post('/deposit', async (req, res) => {
  console.log('Deposit route hit');
  const { accountId, amount } = req.body;

  if (!accountId || !amount) {
    return res.status(400).json({ error: 'Account ID and amount are required' });
  }

  if (amount <= 0) {
    return res.status(400).json({ error: 'Amount must be greater than 0' });
  }

  try {
    // Perform deposit operation in the database
    const result = await pool.query(
      'UPDATE Accounts SET balance = balance + $1 WHERE id = $2 RETURNING balance;',
      [amount, accountId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Respond with success
    res.status(200).json({
      message: `Deposited $${amount} to account ${accountId}`,
      newBalance: result.rows[0].balance,
    });
  } catch (err) {
    console.error('Database error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
