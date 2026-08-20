import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { apiConfig } from '../config/api';

// Create axios instance with config
export const api: AxiosInstance = axios.create(apiConfig);

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token to requests if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const response = await axios.post(apiConfig.baseURL + '/auth/refresh', {}, {
          withCredentials: true
        });
        
        const { token } = response.data;
        localStorage.setItem('token', token);
        
        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (error) {
        // If refresh fails, clear auth and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

// API functions
export const apiService = {
  // Auth
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
    
  register: (userData: any) => 
    api.post('/auth/register', userData),
    
  getCurrentUser: () => 
    api.get('/auth/me'),
    
  // Books
  getBooks: (params?: any) => 
    api.get('/books', { params }),
    
  getBookById: (id: string) => 
    api.get(`/books/${id}`),
    
  // Cart
  getCart: () => 
    api.get('/cart'),
    
  addToCart: (bookId: string, quantity: number = 1) => 
    api.post('/cart/items', { bookId, quantity }),
    
  updateCartItem: (itemId: string, quantity: number) => 
    api.put(`/cart/items/${itemId}`, { quantity }),
    
  removeFromCart: (itemId: string) => 
    api.delete(`/cart/items/${itemId}`),
    
  // Orders
  createOrder: (orderData: any) => 
    api.post('/orders', orderData),
    
  getOrders: () => 
    api.get('/orders'),
    
  getOrderById: (id: string) => 
    api.get(`/orders/${id}`)
};
