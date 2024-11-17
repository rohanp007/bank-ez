import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { depositFunds } from '../utils/api'; // Import the depositFunds function
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import to get account UUID

export default function DepositForm() {
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [balance, setBalance] = useState('');

  // Fetch account ID from storage once the component is loaded
  React.useEffect(() => {
    async function fetchAccountId() {
      try {
        const storedAccountId = await AsyncStorage.getItem('accountUuid');
        if (storedAccountId) {
          setAccountId(storedAccountId); // Automatically set the accountId
        }
      } catch (error) {
        console.error('Error fetching account UUID:', error);
      }
    }

    fetchAccountId();
  }, []);

  const handleDeposit = async () => {
    // Clear any previous messages
    setMessage('');

    // Input validation
    if (!amount || isNaN(amount) || amount <= 0) {
      setMessage('Please enter a valid amount greater than 0.');
      return;
    }

    try {
      // Send deposit request to the backend
      const data = await depositFunds(accountId, parseFloat(amount));
      setMessage(`Deposit successful! New Balance: $${data.newBalance}`);
      setBalance(data.newBalance); // Update the balance state after successful deposit
    } catch (err) {
      setMessage('Deposit failed. Please check the account ID or try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Make a Deposit</Text>
      <Text style={styles.label}>Account ID</Text>
      <TextInput
        placeholder="Account ID"
        value={accountId}
        onChangeText={setAccountId}
        style={styles.input}
        editable={false} // Account ID is set automatically and is not editable
      />
      <Text style={styles.label}>Deposit Amount</Text>
      <TextInput
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button title="Deposit" onPress={handleDeposit} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {balance ? <Text style={styles.balance}>New Balance: ${balance}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 20,
    padding: 10,
  },
  message: {
    marginTop: 10,
    color: 'green',
  },
  balance: {
    marginTop: 10,
    fontSize: 18,
    color: 'blue',
  },
});
