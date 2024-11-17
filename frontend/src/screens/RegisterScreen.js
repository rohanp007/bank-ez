import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { registerUser } from '../utils/api';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    try {
      const data = await registerUser(username, email, password);
      console.log('Registration successful:', data);
      // Redirect to Login
      navigation.navigate('Login');
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Register" onPress={handleRegister} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 20,
    padding: 10,
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});