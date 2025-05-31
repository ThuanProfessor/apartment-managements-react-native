import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'https://bethuandethuong.pythonanywhere.com';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login/',  // Django AuthViewSet login endpoint
  CURRENT_USER: '/users/me/',  // Django UserViewSet current-user endpoint
  CHANGE_PASSWORD: '/users/change_pass/',  // Django UserViewSet change-pass endpoint
  TOKEN: '/o/token/',  // OAuth2 token endpoint
};

// OAuth2 configuration
export const OAUTH_CONFIG = {
  CLIENT_ID: 'c81OcWdfTtyKMGtnTdDbbmRrmfjARgFGphcvXQwy',
  CLIENT_SECRET: 'yHyrcPp7LfKC3dI4pfh1A3bopWltJ84gGDRHCDNwsUpnzM2V4hdNB79qoqa5tkNkUPnSTBw4Br1zRFqs3l2LaUdwTQp4tzaDa00l4BUNrJXdlQHXjRBfjYZjioKBxKMX',
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
