import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS, OAUTH_CONFIG } from '../config/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Đang thử đăng nhập với tài khoản:', { username, password });

      // Tạo request body
      const requestBody = `grant_type=password&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&client_id=${OAUTH_CONFIG.CLIENT_ID}&client_secret=${OAUTH_CONFIG.CLIENT_SECRET}`;

      console.log('URL đăng nhập:', `${API_BASE_URL}/o/token/`);
      console.log('Dữ liệu gửi đi:', requestBody);

      try {
        // Gửi request đăng nhập
        const tokenResponse = await axios.post(
          `${API_BASE_URL}/o/token/`,
          requestBody,
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );

        console.log('Phản hồi từ server:', tokenResponse.data);

        if (!tokenResponse.data.access_token) {
          throw new Error('Không nhận được access token');
        }

        // Lưu token vào storage
        const { access_token, refresh_token } = tokenResponse.data;
        await AsyncStorage.setItem('access_token', access_token);
        await AsyncStorage.setItem('refresh_token', refresh_token);

        // Cập nhật token cho tất cả request
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        axios.defaults.headers.common['Accept'] = 'application/json';
        console.log('Headers đã được set:', axios.defaults.headers.common);

        // Lấy thông tin user
        console.log('Đang lấy thông tin user...');
        console.log('URL lấy thông tin:', `${API_BASE_URL}${API_ENDPOINTS.CURRENT_USER}`);

        try {
          const userResponse = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.CURRENT_USER}`, {
            headers: {
              'Authorization': `Bearer ${access_token}`,
              'Accept': 'application/json'
            }
          });
          console.log('Thông tin user:', userResponse.data);
          const userData = {
            ...userResponse.data,
            token: access_token
          };
          setUser(userData);

          // Kiểm tra is_first_login từ response
          const isFirstLogin = userData.is_first_login === true;
          setIsFirstLogin(isFirstLogin);
          console.log('First login status:', isFirstLogin);

          return {
            success: true,
            isFirstLogin: isFirstLogin,
            user: userData,
            shouldChangePassword: isFirstLogin
          };
        } catch (userError) {
          console.log('Lỗi khi lấy thông tin user:', {
            status: userError.response?.status,
            data: userError.response?.data,
            url: `${API_BASE_URL}${API_ENDPOINTS.CURRENT_USER}`
          });

          // Nếu lỗi permission và chưa đổi mật khẩu
          if (userError.response?.status === 403) {
            return {
              data: {
                is_first_login: true
              }
            };
          }

          throw new Error('Không thể lấy thông tin user');
        }

      } catch (error) {
        console.log('Chi tiết lỗi:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        throw error;
      }

      try {
        // Now get the user data
        const response = await axios.get(
          `${API_BASE_URL}${API_ENDPOINTS.CURRENT_USER}`
        );

        const userData = response.data;
        setUser(userData);

        // Check if this is first login (password hasn't been changed)
        const isFirstLogin = userData.is_first_login || false;
        setIsFirstLogin(isFirstLogin);

        return {
          success: true,
          isFirstLogin
        };
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setError('User profile not found. Please contact administrator.');
        } else {
          setError('Failed to fetch user profile. Please try again.');
        }
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Login error details:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        error_description: error.response?.data?.error_description,
        error_type: error.response?.data?.error
      });

      const errorMessage = error.response?.data?.error_description ||
        error.response?.data?.detail ||
        error.response?.data?.error ||
        'Login failed. Please try again.';

      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${API_BASE_URL}${API_ENDPOINTS.CHANGE_PASSWORD}`,
        {
          old_password: oldPassword,
          new_password: newPassword
        }
      );

      if (response.data.success) {
        setIsFirstLogin(false);
        return { success: true };
      }

      throw new Error('Password change failed');
    } catch (err) {
      console.error('Password change error:', err);
      return {
        success: false,
        error: err.response?.data?.error || 'Password change failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('user'); // Xóa thông tin user
    setUser(null);
    setIsFirstLogin(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      loading,
      error,
      setError,
      isFirstLogin,
      changePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
