const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const pool = require('../models/database'); // Import database connection
require('dotenv').config();
const router = express.Router();

// Helper function to generate access token
const generateAccessToken = (user) => {
  return jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

// Helper function to generate refresh token
const generateRefreshToken = (user) => {
  return jwt.sign({ user }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

// Register Route
router.post('/register', [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ], async (req, res) => {
  console.log('Register endpoint hit');
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;
  console.log('Received registration data:', { username, email, password });

  try {
    // Check if user already exists in the database
    console.log('Checking if user already exists in the database...');
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
    if (userExists.rowCount > 0) {
      console.log('User already exists with email or username:', email);
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Generate a unique account ID
    const accountId = uuidv4();
    console.log('Generated account UUID:', accountId);

    // Hash the password
    const saltRounds = 10;
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Password hashed successfully.');

    // Save the user in the database
    console.log('Saving user to the database...');
    const insertUserQuery = `
        INSERT INTO users (email, username, password, account_uuid, balance) 
        VALUES ($1, $2, $3, $4, $5) RETURNING *
`   ;
    const newUser = await pool.query(insertUserQuery, [email, username, hashedPassword, uuidv4(), 0]);



    console.log('Account successfully created:', newUser.rows[0]);

    // Generate Tokens
    const accessToken = generateAccessToken(newUser.rows[0].email);
    const refreshToken = generateRefreshToken(newUser.rows[0].email);

    // Send Refresh Token in a Secure, HTTP-Only Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only set `secure` in production
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send Access Token and Account ID as JSON Response
    res.status(201).json({ accessToken, accountUuid: newUser.rows[0].account_uuid });

  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], async (req, res) => {
console.log('Login endpoint hit');

const errors = validationResult(req);
if (!errors.isEmpty()) {
  return res.status(400).json({ errors: errors.array() });
}

const { email, password } = req.body;
console.log('Received login data:', { email });

try {
  // Check if the user exists in the database
  console.log('Checking if user exists in the database...');
  const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

  if (userQuery.rowCount === 0) {
    console.log('User not found with email:', email);
    return res.status(400).json({ msg: 'Invalid credentials' });
  }

  const user = userQuery.rows[0];
  console.log('User found:', user);

  // Compare the provided password with the hashed password in the database
  console.log('Validating password...');
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    console.log('Password validation failed');
    return res.status(400).json({ msg: 'Invalid credentials' });
  }

  console.log('Password validated successfully.');

  // Generate Tokens
  const accessToken = generateAccessToken(user.email);
  const refreshToken = generateRefreshToken(user.email);

  // Send Refresh Token in a Secure, HTTP-Only Cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only set `secure` in production
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // Send Access Token and User Details as JSON Response
  res.status(200).json({
    accessToken,
    accountUuid: user.account_uuid,
    username: user.username,
    balance: user.balance,
  });
} catch (err) {
  console.error('Login error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
}
});


module.exports = router;
