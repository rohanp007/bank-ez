const { Pool } = require('pg'); // Import Pool from 'pg' library
require('dotenv').config(); // Load environment variables

// Set up the connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Export the pool instance to be used in other files
module.exports = pool;
