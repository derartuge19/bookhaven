import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext'; // Update import path
import axios from 'axios';

interface CartItem {
  id: string;
  bookId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartContextType {
  items: CartItem[];
  total: number;
  itemCount: number; // Add itemCount to CartContextType
  addToCart: (book: Omit<CartItem, 'id' | 'quantity'>) => Promise<void>;
  updateQuantity: (bookId: string, quantity: number) => Promise<void>;
  removeFromCart: (bookId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  // Fetch cart when user logs in/out
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Clear cart when user logs out
      setItems([]);
      setTotal(0);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await axios.get('/api/cart');
      setItems(response.data.items);
      setTotal(response.data.total);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (book: Omit<CartItem, 'id' | 'quantity'>) => {
    if (!isAuthenticated) {
      throw new Error('Please log in to add items to cart');
    }
  
    try {
      setLoading(true);
      const response = await axios.post('/api/cart/items', {
        bookId: book.bookId,
        title: book.title,
        price: book.price,
        image: book.image,
        quantity: 1
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data && response.data.items) {
        setItems(response.data.items || []);
        setTotal(response.data.total || 0);
      } else {
        throw new Error(response.data?.message || 'Failed to add item to cart');
      }
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Failed to add item to cart. Please try again.';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (bookId: string, quantity: number) => {
    if (!isAuthenticated) return;

    try {
      const response = await axios.put(`/api/cart/items/${bookId}`, { quantity });
      setItems(response.data.items);
      setTotal(response.data.total);
    } catch (err) {
      console.error('Error updating cart item:', err);
      throw new Error('Failed to update cart item');
    }
  };

  const removeFromCart = async (bookId: string) => {
    if (!isAuthenticated) return;

    try {
      await axios.delete(`/api/cart/items/${bookId}`);
      setItems(prev => prev.filter(item => item.bookId !== bookId));
      // Note: The backend will handle updating the total
      await fetchCart(); // Refresh cart to get updated total
    } catch (err) {
      console.error('Error removing from cart:', err);
      throw new Error('Failed to remove item from cart');
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;

    try {
      await axios.delete('/api/cart');
      setItems([]);
      setTotal(0);
    } catch (err) {
      console.error('Error clearing cart:', err);
      throw new Error('Failed to clear cart');
    }
  };

  return (
    <CartContext.Provider
      value={{
        items: items || [], // Ensure items is always an array
        total: total || 0,
        itemCount: (items || []).reduce((count, item) => count + (item?.quantity || 0), 0), // Add null checks
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        loading,
        error,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
