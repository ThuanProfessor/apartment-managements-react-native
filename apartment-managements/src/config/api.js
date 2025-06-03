import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'https://7006-118-68-25-55.ngrok-free.app'; // Cập nhật URL ngrok mới

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
  LOCKERS: (userId) => `/api/apartment/users/${userId}/lockers/`,
  LOCKER_DETAIL: (userId, lockerId) => `/api/apartment/users/${userId}/lockers/${lockerId}/`,
};

// OAuth2 configuration
export const OAUTH_CONFIG = {
  CLIENT_ID: '3RmrCK0lxzpRS8E877xpVwfwq3LahldYvHnw3X6x',
  CLIENT_SECRET: 'Z2kPsxPENT0qo8zUSXTJjhTtplJw3glH98BnB13FcxHOk92AmgRK5BeG0Zk5R6qRs6peFcX4JuS8kOfrlEB1BPCVGf363XALUEMrnx4ppfa0SrdZk0fOf3Vmrm8HAJlH',
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
      config.headers.Authorization = `Bearer ${token}`; // Changed from Token to Bearer
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
        originalRequest.headers.Authorization = `Token ${access_token}`;
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

// Thêm config cho axios
axios.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default api;
