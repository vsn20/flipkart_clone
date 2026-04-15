'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '@/lib/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [summary, setSummary] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      setSummary(null);
      setCartCount(0);
      return;
    }
    try {
      setLoading(true);
      const res = await cartAPI.get();
      setCart(res.data.cart);
      setSummary(res.data.summary);
      setCartCount(parseInt(res.data.summary?.itemCount) || 0);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return false;
    }
    try {
      await cartAPI.add({ product_id: productId, quantity });
      toast.success('Added to cart!');
      await fetchCart();
      return true;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to add to cart';
      toast.error(msg);
      return false;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      await cartAPI.update(itemId, { quantity });
      await fetchCart();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update';
      toast.error(msg);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await cartAPI.remove(itemId);
      toast.success('Item removed from cart');
      await fetchCart();
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clear();
      await fetchCart();
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      summary,
      cartCount,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      fetchCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
