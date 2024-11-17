import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { loginUser } from '../utils/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const data = await loginUser(email, password);
      console.log('Login successful:', data);
      navigation.navigate('Dashboard'); // Assuming you have a Dashboard screen
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <View style={styles.container}>
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
      <Button title="Login" onPress={handleLogin} />
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
