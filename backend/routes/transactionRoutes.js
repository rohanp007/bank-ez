const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // Import authentication middleware
const pool = require('../models/database');

// Deposit Money Route (Protected)
router.post('/deposit', async (req, res) => {
  console.log('Deposit route hit');
  const { accountId, amount } = req.body;

  console.log('Account ID being queried:', accountId); // Log the account ID to verify

  if (!accountId || !amount) {
    return res.status(400).json({ error: 'Account ID and amount are required' });
  }

  if (amount <= 0) {
    return res.status(400).json({ error: 'Amount must be greater than 0' });
  }

  try {
    // Log the query parameters
    console.log(`Preparing to execute query with: accountId = ${accountId}, amount = ${amount}`);

    // Perform deposit operation in the database
    const result = await pool.query(
      'UPDATE users SET balance = balance + $1 WHERE account_uuid = $2 RETURNING balance;',
      [amount, String(accountId)]  // Ensure accountId is passed as a string
    );
    

    if (result.rowCount === 0) {
      console.log('Account not found:', accountId);
      return res.status(404).json({ error: 'Account not found' });
    }

    // Respond with success
    console.log('Account found, balance updated.', result.rows[0]);
    res.status(200).json({
      message: `Deposited $${amount} to account ${accountId}`,
      newBalance: result.rows[0].balance,
    });
  } catch (err) {
    console.error('Database error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/withdraw', async (req, res) => {
  console.log('Withdraw route hit');
  const { accountId, amount } = req.body;

  console.log('Account ID being queried:', accountId); // Log the account ID to verify

  if (!accountId || !amount) {
    return res.status(400).json({ error: 'Account ID and amount are required' });
  }

  if (amount <= 0) {
    return res.status(400).json({ error: 'Amount must be greater than 0' });
  }

  try {
    // Check if the account exists and fetch the current balance
    const accountCheck = await pool.query(
      'SELECT balance FROM users WHERE account_uuid = $1;',
      [String(accountId)]
    );

    if (accountCheck.rowCount === 0) {
      console.log('Account not found:', accountId);
      return res.status(404).json({ error: 'Account not found' });
    }

    const currentBalance = accountCheck.rows[0].balance;

    // Check if the balance is sufficient for the withdrawal
    if (currentBalance < amount) {
      console.log(
        `Insufficient funds for account: ${accountId}. Current balance: ${currentBalance}, Withdrawal amount: ${amount}`
      );
      return res.status(400).json({
        error: 'Insufficient funds',
        currentBalance,
      });
    }

    // Perform withdrawal operation in the database
    const result = await pool.query(
      'UPDATE users SET balance = balance - $1 WHERE account_uuid = $2 RETURNING balance;',
      [amount, String(accountId)]
    );

    // Respond with success
    console.log('Withdrawal successful. Updated balance:', result.rows[0]);
    res.status(200).json({
      message: `Withdrew $${amount} from account ${accountId}`,
      newBalance: result.rows[0].balance,
    });
  } catch (err) {
    console.error('Database error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/add-transaction', async (req, res) => {
  const { accountId, amount, transactionType } = req.body;

  if (!accountId || !amount || !transactionType) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Validate the account UUID
    const accountCheck = await pool.query('SELECT * FROM users WHERE account_uuid = $1', [accountId]);
    if (accountCheck.rowCount === 0) {
      return res.status(400).json({ error: 'Account ID does not exist' });
    }

    // Insert the transaction
    const insertTransactionQuery = `
      INSERT INTO transactions (account_uuid, amount, transaction_type, timestamp)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      RETURNING transaction_uuid;
    `;

    const transactionResult = await pool.query(insertTransactionQuery, [accountId, amount, transactionType]);
    res.status(200).json({
      message: 'Transaction added successfully',
      transactionId: transactionResult.rows[0].transaction_uuid,
    });
  } catch (err) {
    console.error('Error adding transaction:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const axios = require('axios');

// Route to detect fraud using Python service
router.post('/predict-fraud', async (req, res) => {
    const transactionDetails = req.body;

    try {
        const response = await axios.post('http://127.0.0.1:5000/detect-fraud', transactionDetails);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error calling Python service:', error.message);
        res.status(500).json({ error: 'Fraud detection service failed' });
    }
});

router.get('/transactions-with-fraud', async (req, res) => {
  try {
      const query = `
          SELECT 
              t.transaction_uuid,
              t.amount,
              t.transaction_type,
              t.timestamp,
              CASE WHEN f.transaction_id IS NOT NULL THEN 1 ELSE 0 END AS is_fraud
          FROM transactions t
          LEFT JOIN fraud_detection f ON t.transaction_uuid = f.transaction_id;
      `;
      const result = await pool.query(query);
      res.status(200).json(result.rows);
  } catch (err) {
      console.error('Error fetching transactions:', err.message);
      res.status(500).json({ error: 'Internal server error' });
  }
});


const { checkFraud } = require('../utils/fraudDetection');


router.post('/process-transaction', async (req, res) => {
    const transactionData = req.body;


    try {
        // Call the fraud detection service
        const fraudResult = await checkFraud(transactionData);

        if (fraudResult.is_fraud) {
            return res.status(400).json({
                message: 'Transaction flagged as fraudulent',
                fraudProbability: fraudResult.fraud_probability,
                reason: fraudResult.reason
            });
        }

        // Proceed with the transaction (e.g., save to DB)
        res.json({
            message: 'Transaction processed successfully',
            fraudProbability: fraudResult.fraud_probability
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;


