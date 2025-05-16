import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS, OAUTH_CONFIG } from '../config/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);

      // First, get the OAuth2 token
      const tokenData = new URLSearchParams();
      tokenData.append('grant_type', 'password');
      tokenData.append('username', username);
      tokenData.append('password', password);
      tokenData.append('client_id', OAUTH_CONFIG.CLIENT_ID);
      tokenData.append('client_secret', OAUTH_CONFIG.CLIENT_SECRET);

      const tokenResponse = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.TOKEN}`,
        tokenData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      // Store the access token
      const { access_token } = tokenResponse.data;
      await AsyncStorage.setItem('access_token', access_token);
      
      // Set the token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      // Now get the user data
      const response = await axios.get(
        `${API_BASE_URL}${API_ENDPOINTS.CURRENT_USER}`
      );

      console.log('Login response:', response.data);

      // Store user data
      const userData = response.data;
      setUser(userData);
      return { success: true, user: userData };

    } catch (err) {
      console.error('Login error details:', {
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url
      });
      return { 
        success: false, 
        error: err.response?.data?.error || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      loading,
      error,
      setError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
