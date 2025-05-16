import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'https://bethuandethuong.pythonanywhere.com';

export const API_ENDPOINTS = {
  // Auth endpoints
  TOKEN: '/o/token/',  // OAuth2 token endpoint
  CURRENT_USER: '/users/current-user/',  // Django UserViewSet current-user endpoint
  CHANGE_PASSWORD: '/users/change_pass/',  // Django UserViewSet change-pass endpoint
};

// OAuth2 configuration
export const OAUTH_CONFIG = {
  CLIENT_ID: 'zvoSUNtjdcLVl9GI95bjQ9wGVjAEYaxOHJysLrZA',
  CLIENT_SECRET: 'jnHoe8Dgbu4PudCfoitcEigXOzxxCDlgCW9M24bpkRLC8AsS4u3Ya7V11AsCO3M4tzaVoOmgaCKpHf5uVFWQncaLCAfc8SBtmDtcGIkskUy6YSps2UzkOIyUaqGrWpcV'
};

// Configure axios defaults
axios.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);
