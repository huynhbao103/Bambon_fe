import React, { useState } from 'react';
import { View, ScrollView, TextInput, Button, Text, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { Link } from 'expo-router';
import { BACKEND_URL } from '../../config'; 

const RegisterScreen: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const register = async () => {
    try {
      const response = await axios.post<{ message: string }>(`${BACKEND_URL}/auth/register`, {
        name,
        email,
        password,
      });
      console.log('Response Status:', response.status);
      if (response.status === 200 && response.data.message === 'User registered') {
        setSuccessMessage('Registration successful!');
      } else {
        setError('Registration failed');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Registration failed');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
      {successMessage && <Text style={styles.successText}>{successMessage}</Text>}
      <Button title="Register" onPress={register} color="#32CD32" />
      <Link href='/pages/login' style={styles.loginLink}>
        <Text style={styles.loginText}>Already have an account? Login</Text>
      </Link>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#32CD32',
    marginBottom: 30,
  },
  input: {
    height: 45,
    borderColor: '#32CD32',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingLeft: 10,
    backgroundColor: '#fff',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
  successText: {
    color: '#32CD32',
    textAlign: 'center',
    marginBottom: 15,
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    color: '#32CD32',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
