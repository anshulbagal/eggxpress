import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api' });

// Attach Bearer token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchMenu     = (params = {}) => API.get('/menu', { params });
export const fetchMenuItem = (id)          => API.get(`/menu/${id}`);
export const createOrder   = (data)        => API.post('/orders', data);
export const fetchMyOrders = ()            => API.get('/orders/my');
export const fetchOrder    = (id)          => API.get(`/orders/${id}`);
export const fetchAllOrders    = ()           => API.get('/orders');
export const updateOrderStatus = (id, status) => API.put(`/orders/${id}/status`, { status });

// Razorpay payment
export const createRazorpayOrder = (amount)     => API.post('/payment/create-order', { amount });
export const verifyPayment       = (data)        => API.post('/payment/verify', data);

// Promo codes
export const validatePromoCode = (code, orderAmount) =>
  API.post('/promo/validate', { code, orderAmount });

// Auth
export const loginUser    = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);
export const getMe        = ()     => API.get('/auth/me');

export default API;
