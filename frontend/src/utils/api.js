import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api' });

export const fetchMenu = (params = {}) => API.get('/menu', { params });
export const fetchMenuItem = (id) => API.get(`/menu/${id}`);
export const createOrder = (data) => API.post('/orders', data);
export const fetchOrder = (id) => API.get(`/orders/${id}`);
export const fetchAllOrders = () => API.get('/orders');
export const updateOrderStatus = (id, status) => API.put(`/orders/${id}/status`, { status });
export const adminLogin = (creds) => API.post('/auth/login', creds);

export default API;
