require('dotenv').config();

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Import CORS package
const { pool } = require('./models/database'); // Import connection from database.js
const transactionRoutes = require('./routes/transactionRoutes');

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

const path = require('path');

// Enable CORS for all routes
app.use(cors()); // Allow cross-origin requests

// Middleware
app.use(express.json());

// API Routes
app.use('/api/transactions', transactionRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});