import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'https://ef54-113-161-52-173.ngrok-free.app';

// Cloudinary configuration for unsigned upload
export const CLOUDINARY_CONFIG = {
  cloud_name: 'dg5ts9slf',
  upload_preset: 'ml_default' // Using unsigned upload preset
};

export const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloud_name}/image/upload`;

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login/',  // Django AuthViewSet login endpoint
  CURRENT_USER: '/users/current-user/',  // Django UserViewSet current-user endpoint
  CHANGE_PASSWORD: '/users/change_pass/',  // Django UserViewSet change-pass endpoint
  TOKEN: '/o/token/',  // OAuth2 token endpoint
  UPLOAD_AVATAR: '/upload-avatar/upload/',  // Upload avatar endpoint
  
  // Bill endpoints
  BILLS: '/bills/',
  UNPAID_BILLS: '/bills/unpaid',
  BILL_UPLOAD_PROOF: (billId) => `/bills/${billId}/upload_proof/`,
  PAYMENTS: '/payments/',
  
  // Feedback endpoints
  COMPLAINTS: '/feedbacks/',
  
  // Survey endpoints
  SURVEYS: '/surveys/',
  SURVEY_RESPONSES: '/survey-responses/',
  
  // Parking endpoints
  PARKING_CARDS: '/parking-cards/',
  
  // Locker endpoints
  LOCKERS: '/lockers/',
  LOCKER_BOOKINGS: '/locker-bookings/',

  CARD_REQUESTS: '/card-requests/',
};

// OAuth2 configuration
export const OAUTH_CONFIG = {
  CLIENT_ID: '9sExt6HYKW9sjcQap4vy55pqj7DzNfbmblvt7e27',
  CLIENT_SECRET: 'b2GkU6PBXrG0GnShwrMdPvRTNI0TlNXUsGsQC79SwSPg1Vc7d5NqkSBkxB9qazCBOufgAZWA6MJ6w9ogL8yfMmj7sWEhlsHAiaM88IgtsgKAATF6R61tejxrppQ4AtPN',
};

// Helper function to encode form data
export const encodeFormData = (data) => {
  return Object.keys(data)
    .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');
};

// Helper function to get headers with auth token
export const getHeaders = (token) => {
  if (!token) return {};
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json'
  };
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
        const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.TOKEN}`, 
          encodeFormData({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: OAUTH_CONFIG.CLIENT_ID,
            client_secret: OAUTH_CONFIG.CLIENT_SECRET,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );

        const { access_token } = response.data;
        await AsyncStorage.setItem('access_token', access_token);

        // Update auth header and retry original request
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        return api(originalRequest);
      } catch (err) {
        // If refresh fails, redirect to login
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
