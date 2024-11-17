import React, { useState } from 'react';
import axios from 'axios'; // Axios is a library for making HTTP requests

function DepositForm() {
  // State variables to store form inputs and response messages
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  // Function to handle the form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('http://localhost:5000/api/transactions/deposit', {
        accountId,
        amount: parseFloat(amount),
      });
      setMessage(response.data.message);
    } catch (error) {
      console.error('Error:', error);
      setMessage(error.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <div>
      <h2>Deposit Money</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Account ID:</label>
          <input
            type="text"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Amount:</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <button type="submit">Deposit</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default DepositForm;
