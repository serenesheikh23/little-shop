// src/CartContext.jsx — Unified cart (local for guests, server for logged-in)
import { useReducer, useEffect, useCallback } from 'react';
import { CartContext } from './contexts/CartContext';
import { cartReducer, initialCartState } from './cartReducer';
import { getAuthToken, addToCart as apiAddToCart, fetchCart, updateCartItem, removeCartItem, clearCart as apiClearCart } from './api';

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  useEffect(() => {
    if (!getAuthToken()) {
      localStorage.setItem('cart', JSON.stringify(state));
    }
  }, [state]);

  // Sync server cart to local state when user logs in
  useEffect(() => {
    if (getAuthToken()) {
      fetchCart()
        .then(items => {
          const mapped = items.map(item => ({
            product: {
              id: item.product_id,
              name: item.name,
              price: item.price,
              image: item.image,
              emoji: item.emoji,
              stock: item.stock,
              description: item.description
            },
            qty: item.quantity,
            cartId: item.id
          }));
          // Merge with any existing local cart
          const merged = [...mapped];
          // Clear local-only state and use server cart
          dispatch({ type: 'SET', items: merged });
          localStorage.setItem('cart', JSON.stringify(merged));
        })
        .catch(() => {});
    }
  }, []);

  // Re-read from localStorage on mount if no token
  useEffect(() => {
    if (!getAuthToken() && state.length === 0) {
      const saved = localStorage.getItem("cart");
      if (saved) {
        try { dispatch({ type: 'SET', items: JSON.parse(saved) }); } catch {}
      }
    }
  }, []);

  const addToCart = useCallback(async (product) => {
    if (getAuthToken()) {
      try {
        await apiAddToCart(product.id);
        // Re-fetch cart to get updated state
        const items = await fetchCart();
        const mapped = items.map(item => ({
          product: {
            id: item.product_id,
            name: item.name,
            price: item.price,
            image: item.image,
            emoji: item.emoji,
            stock: item.stock,
            description: item.description
          },
          qty: item.quantity,
          cartId: item.id
        }));
        dispatch({ type: 'SET', items: mapped });
        return true;
      } catch (err) {
        throw err;
      }
    } else {
      dispatch({ type: 'ADD', product });
      return true;
    }
  }, []);

  const changeQty = useCallback(async (productId, delta) => {
    if (getAuthToken()) {
      const item = state.find(i => i.product.id === productId);
      if (item && item.cartId) {
        const newQty = item.qty + delta;
        if (newQty <= 0) {
          await removeCartItem(item.cartId);
        } else {
          await updateCartItem(item.cartId, newQty);
        }
        const items = await fetchCart();
        const mapped = items.map(item => ({
          product: {
            id: item.product_id,
            name: item.name,
            price: item.price,
            image: item.image,
            emoji: item.emoji,
            stock: item.stock,
            description: item.description
          },
          qty: item.quantity,
          cartId: item.id
        }));
        dispatch({ type: 'SET', items: mapped });
      }
    } else {
      dispatch({ type: 'CHANGE_QTY', productId, delta });
    }
  }, [state, getAuthToken]);

  const clearCart = useCallback(async () => {
    if (getAuthToken()) {
      try { await apiClearCart(); } catch {}
    }
    dispatch({ type: 'CLEAR' });
  }, []);

  const total = state.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const itemCount = state.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider value={{ cartItems: state, addToCart, changeQty, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}