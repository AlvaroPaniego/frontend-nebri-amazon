/**
 * src/services/cartService.js
 * Servicio de Carrito de Compras
 */

import api from './api';

export const syncCart = async (cartId, items) => {
  const response = await api.post('/cart/sync', { items });
  return response.data;
};

export const addCartItem = async (cartId, productId, quantity) => {
  const response = await api.post('/cart/items', { product_id: productId, quantity });
  return response.data;
};

export const updateCartItem = async (cartId, itemId, quantity) => {
  const response = await api.put(`/cart/items/${itemId}`, { quantity });
  return response.data;
};

export const removeCartItem = async (cartId, itemId) => {
  const response = await api.delete(`/cart/items/${itemId}`);
  return response.data;
};

export const clearCart = async (cartId) => {
  const response = await api.delete('/cart');
  return response.data;
};
