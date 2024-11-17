const jwt = require('jsonwebtoken');
require('dotenv').config();
const express = require('express');
const router = express.Router();

const auth = (req, res, next) => {
  // Extract token from Authorization header
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify the token using the JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next(); // Proceed to next middleware or route handler
  } catch (err) {
    console.error('Token verification failed:', err.message); // Log the error
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

router.post('/deposit', auth, async (req, res) => {
    console.log('Deposit route hit');
    const { accountId, amount } = req.body;
  
    // Log the received accountId to check if it matches what you expect
    console.log('Received Account ID:', accountId);
  
    if (!accountId || !amount) {
      return res.status(400).json({ error: 'Account ID and amount are required' });
    }
  
    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }
  
    try {
      console.log(`Looking for user with account UUID: ${accountId}`);
      const result = await pool.query(
        'UPDATE users SET balance = balance + $1 WHERE account_uuid = $2 RETURNING balance;',
        [amount, String(accountId)]  // Explicitly convert to string
      );
  
      if (result.rowCount === 0) {
        console.log('Account not found:', accountId);
        return res.status(404).json({ error: 'Account not found' });
      }
  
      // Respond with success
      console.log('Account found, balance updated.');
      res.status(200).json({
        message: `Deposited $${amount} to account ${accountId}`,
        newBalance: result.rows[0].balance,
      });
    } catch (err) {
      console.error('Database error:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
});
  

module.exports = auth;