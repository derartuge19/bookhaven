import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { api } from '../services/api'; 

interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  profileImage?: string;
  isAdmin: boolean;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<{ success: boolean }>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // In AuthContext.tsx
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    // Only set auth header for your backend API
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchUser();
  } else {
    setLoading(false);
  }
}, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/auth/me');
      setUser(response.data);
    } catch (err) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      console.log('Attempting to register with data:', userData);
      
      // Ensure all required fields are present and not just whitespace
      if (!userData.username?.trim() || !userData.email?.trim() || !userData.password || !userData.fullName?.trim()) {
        throw new Error('All fields are required');
      }
  
      // Prepare the data object with trimmed values
      const registrationData = {
        username: userData.username.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password,
        fullName: userData.fullName.trim()
      };
  
      console.log('Sending registration data:', registrationData);
      
      const response = await axios.post(
        'http://localhost:5000/api/auth/register',
        registrationData,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      console.log('Registration response:', response);
  
      if (response.status >= 400) {
        const errorMessage = response.data?.message || 'Registration failed';
        throw new Error(errorMessage);
      }
    
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      setError(null);
      return { success: true };
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
