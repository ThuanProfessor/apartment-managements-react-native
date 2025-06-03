import React, { useState } from 'react';
import { View, StyleSheet, ImageBackground, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Title, Text, Surface, useTheme } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { OAUTH_CONFIG, API_BASE_URL } from '../../config/api';

const LoginScreen = () => {
  const { login, error: authError, setError } = useAuth();
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      const result = await login(username.trim(), password.trim()); // Truyền username và password từ state
      if (result.success) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'TabNavigator' }], // Sửa lại thành 'TabNavigator'
        });
      } else {
        setError(result.error || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      setError(error.response?.data?.error_description || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../assets/images/background-images-login.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <KeyboardAvoidingView 
        style={styles.formWrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Surface style={styles.logoContainer} elevation={0}>
            <MaterialCommunityIcons
              name="home-city"
              size={100}
              color="#FFFFFF"
            />
            <Title style={styles.title}>Apartment Management</Title>
            <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>
          </Surface>

          <Surface style={styles.formContainer} elevation={2}>
            <TextInput
              label="Tên đăng nhập"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="account" />}
              autoCapitalize="none"
            />

            <TextInput
              label="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureTextEntry}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={secureTextEntry ? 'eye' : 'eye-off'}
                  onPress={() => setSecureTextEntry(!secureTextEntry)}
                />
              }
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              style={styles.button}
              contentStyle={styles.buttonContent}
            >
              Đăng nhập
            </Button>

            {authError && <Text style={styles.error}>{authError}</Text>}
          </Surface>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  formWrapper: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#FFFFFF', // Make title text white
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  subtitle: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  formContainer: {
    padding: 20,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Make input background slightly transparent
  },
  button: {
    marginTop: 20,
    paddingVertical: 6,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default LoginScreen;
