/**
 * src/services/orderService.js
 * Servicio de Procesamiento de Pedidos
 */

import api from './api';

const isTypedError = (err) => !!(err?.status && err?.code);

export const placeOrder = async (shippingData, paymentData, cartItems, orderTotal) => {
  const rawCardNumber = paymentData.cardNumber.replace(/\s/g, '');

  const sanitizedPayment = {
    cardholderName: paymentData.cardholderName,
    cardLastFour: rawCardNumber.slice(-4),
    expiry: paymentData.expiry,
  };

  const sharedItems = cartItems.map((item) => ({
    productId: item.product.id,
    sku: item.product.sku,
    quantity: item.quantity,
    unitPrice: item.product.price,
  }));

  const backendPayload = {
    shipping: shippingData,
    payment: sanitizedPayment,
    items: sharedItems,
    total: orderTotal,
  };

  try {
    const response = await api.post('/orders', backendPayload);
    return response.data;
  } catch (error) {
    if (isTypedError(error)) {
      throw error;
    }
    throw error;
  }
};

export const getUserOrders = async () => {
  try {
    const response = await api.get('/orders');
    return response.data;
  } catch (error) {
    if (isTypedError(error)) {
      throw error;
    }
    throw error;
  }
};

