import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'https://bethuandethuong.pythonanywhere.com';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login/',  // Django AuthViewSet login endpoint
  CURRENT_USER: '/users/me/',  // Django UserViewSet current-user endpoint
  CHANGE_PASSWORD: '/users/change_pass/',  // Django UserViewSet change-pass endpoint
  TOKEN: '/o/token/',  // OAuth2 token endpoint
  
  // Bill endpoints
  BILLS: '/bills/',
  BILL_UPLOAD_PROOF: (billId) => `/bills/${billId}/upload_proof/`,
  
  // Complaint endpoints
  COMPLAINTS: '/complaints/',
  
  // Survey endpoints
  SURVEYS: '/surveys/',
  SURVEY_RESPONSES: '/survey-responses/',
  
  // Parking endpoints
  PARKING_CARDS: '/parking-cards/',
  
  // Locker endpoints
  LOCKERS: '/lockers/',
  LOCKER_BOOKINGS: '/locker-bookings/',
};

// OAuth2 configuration
export const OAUTH_CONFIG = {
  CLIENT_ID: 'c81OcWdfTtyKMGtnTdDbbmRrmfjARgFGphcvXQwy',
  CLIENT_SECRET: 'yHyrcPp7LfKC3dI4pfh1A3bopWltJ84gGDRHCDNwsUpnzM2V4hdNB79qoqa5tkNkUPnSTBw4Br1zRFqs3l2LaUdwTQp4tzaDa00l4BUNrJXdlQHXjRBfjYZjioKBxKMX',
};

// Configure axios defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
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

// Add response interceptor for token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh token yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Request new token
        const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.TOKEN}`, {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: OAUTH_CONFIG.CLIENT_ID,
          client_secret: OAUTH_CONFIG.CLIENT_SECRET,
        });

        const { access_token } = response.data;
        
        // Save new token
        await AsyncStorage.setItem('access_token', access_token);
        
        // Update authorization header
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        
        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        // You might want to trigger navigation to login screen here
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
