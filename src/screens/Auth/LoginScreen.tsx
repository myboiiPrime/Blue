import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import CandlestickBackground from '../../components/CandlestickBackground';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    // Validate inputs
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await api.post('/auth/signin', {
        email,
        password
      });
      
      setIsLoading(false);
      
      if (response.data && response.data.jwt) {
        await AsyncStorage.setItem('token', response.data.jwt);
        navigation.navigate('MainApp');
      } else {
        Alert.alert('Error', 'Login failed');
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Login error:', error);
      Alert.alert('Error', 'Invalid credentials or server error');
    }
  };

  // Test function to bypass authentication
  const handleTestLogin = async () => {
    try {
      // Set a dummy token for testing purposes
      await AsyncStorage.setItem('token', 'test-token-for-development');
      navigation.navigate('MainApp');
    } catch (error) {
      console.error('Test login error:', error);
      Alert.alert('Error', 'Test login failed');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <CandlestickBackground opacity={0.5} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue to Blue</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Test Button for Development */}
          <TouchableOpacity 
            style={styles.testButton}
            onPress={handleTestLogin}
          >
            <Text style={styles.testButtonText}>
              🚀 Test Login (Skip Auth)
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signupText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  formContainer: {
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#F8FAFC',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#1E3A8A',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#1E3A8A',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#94A3B8',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // New styles for test button
  testButton: {
    backgroundColor: '#F59E0B',
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    borderWidth: 2,
    borderColor: '#D97706',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
  },
  signupText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
  },
});

export default LoginScreen;