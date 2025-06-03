// Replace this URL with your current ngrok URL when you start ngrok
const BASE_URL = 'https://2551-14-187-11-253.ngrok-free.app/';

const endpoints = {
    'users': '/users/',
    'apartments': '/apartments/',
    'auth': {
        'login': '/auth/login/',
        'register': '/auth/register/',
        'changePassword': '/auth/change-password/',
    },
    'payments': {
        'create': '/payments/create/',
        'history': '/payments/history/',
    },
    'parking': '/parking-cards/',
    'complaints': '/complaints/',
    'surveys': '/surveys/',
    'notifications': '/notifications/',
};

export { BASE_URL, endpoints };
