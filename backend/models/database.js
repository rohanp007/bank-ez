require('dotenv').config();
const { Pool } = require('pg');

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres', // PostgreSQL username
  host: process.env.DB_HOST || 'localhost', // PostgreSQL host
  database: process.env.DB_NAME || 'bank-ez', // Database name
  password: String(process.env.DB_PASSWORD), // Database password
  port: process.env.DB_PORT || '5432', // Port number
  max: 10, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error if connection takes longer than 2 seconds
});

// Test the connection on startup
pool.connect()
  .then((client) => {
    console.log('Connected to PostgreSQL successfully');
    client.release(); // Release the client back to the pool
  })
  .catch((err) => {
    console.error('Failed to connect to PostgreSQL:', err.message);
    process.exit(1); // Exit the process if the connection fails
  });

// Export the pool for use in other files
module.exports = { pool };
