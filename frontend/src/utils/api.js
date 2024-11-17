import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Set the base URL of your backend server
const api = axios.create({
  baseURL: 'http://10.155.164.0:5000/api',
});

// Intercept each request to add Authorization header
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// User Registration
export const registerUser = async (username, email, password) => {
  try {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  } catch (error) {
    console.error('Register Error:', error.response.data);
    throw error;
  }
};

// User Login
export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    await AsyncStorage.setItem('accessToken', response.data.accessToken);
    await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
    return response.data;
  } catch (error) {
    console.error('Login Error:', error.response.data);
    throw error;
  }
};

// Deposit Funds
export const depositFunds = async (accountId, amount) => {
  try {
    const response = await api.post('/transactions/deposit', { accountId, amount });
    return response.data;
  } catch (error) {
    console.error('Deposit Error:', error.response.data);
    throw error;
  }
};

export default api;