import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import Dashboard from './components/Dashboard';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Register">
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Dashboard" component={Dashboard} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
