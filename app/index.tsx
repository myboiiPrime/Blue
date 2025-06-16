import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CandlestickBackground from '../src/components/CandlestickBackground';
import api from '../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Welcome() {
  const navigation = useNavigation();

  const handleGuestLogin = async () => {
    try {
      // Use the DEFAULT_USER credentials for guest login
      const response = await api.post('/auth/signin', {
        email: 'guest@example.com',
        password: 'guest123'
      });
      
      if (response.data && response.data.jwt) {
        // Store the token
        await AsyncStorage.setItem('token', response.data.jwt);
        // Navigate to main app
        navigation.navigate('MainApp');
      } else {
        Alert.alert('Error', 'Guest login failed');
      }
    } catch (error) {
      console.error('Guest login error:', error);
      Alert.alert('Error', 'Could not connect to the server');
    }
  };

  return (
    <View style={styles.container}>
      <CandlestickBackground opacity={0.1} />
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          {/* You can add your logo here */}
          <Text style={styles.logo}>BLUE</Text>
          <Text style={styles.tagline}>Stock Exchange</Text>
        </View>

        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome to Blue</Text>
          <Text style={styles.welcomeText}>
            Your gateway to the world of stock trading
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.loginButton]} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.guestButton]} 
            onPress={handleGuestLogin}
          >
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  tagline: {
    fontSize: 18,
    color: '#64748B',
    marginTop: 5,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: '#1E3A8A',
  },
  guestButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  guestButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
});