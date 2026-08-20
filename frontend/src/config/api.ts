const API_BASE_URL = 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    ME: `${API_BASE_URL}/auth/me`,
    REFRESH: `${API_BASE_URL}/auth/refresh`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
  },
  BOOKS: {
    BASE: `${API_BASE_URL}/books`,
    SEARCH: (query: string) => `${API_BASE_URL}/books?q=${encodeURIComponent(query)}`,
    DETAIL: (id: string) => `${API_BASE_URL}/books/${id}`,
  },
  CART: {
    BASE: `${API_BASE_URL}/cart`,
    ITEM: (id: string) => `${API_BASE_URL}/cart/items/${id}`,
  },
  ORDERS: {
    BASE: `${API_BASE_URL}/orders`,
    DETAIL: (id: string) => `${API_BASE_URL}/orders/${id}`,
  },
  HEALTH: `${API_BASE_URL}/health`,
};

export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
};
