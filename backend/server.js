require('dotenv').config();

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // Import cookie-parser
const transactionRoutes = require('./routes/transactionRoutes');
const authRoutes = require('./routes/authRoutes'); // Import authentication routes

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser()); // Enable cookie parsing

// API Routes
app.use('/api/transactions', transactionRoutes);
app.use('/api/auth', authRoutes); // Register authentication routes

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});