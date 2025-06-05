import axios from 'axios';

// Tạo một instance API gốc
const API = axios.create({
  baseURL: 'https://cbe9-113-161-52-173.ngrok-free.app'
});

// Định nghĩa các endpoint
const endpoints = {
  users: '/users/',
  apartments: '/apartments/',
  bills: '/bills/',
  login: '/o/token/',
  payment: '/payment/',
  'current-user': '/users/current-user/',
  uploadProof: '/upload-proof/',
  lockers: "/lockers/",
};

// Hàm authAPI thêm token vào header Authorization
export const authAPI = (token) =>
  axios.create({
    baseURL: API.defaults.baseURL,
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

export { endpoints };    
export default API;        
