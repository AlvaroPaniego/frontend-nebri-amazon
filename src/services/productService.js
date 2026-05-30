/**
 * src/services/productService.js
 * Servicio de Productos
 */

import api from './api';

export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const getProductBySku = async (sku) => {
  if (!sku) {
    throw new Error('El SKU del producto es obligatorio.');
  }

  try {
    const products = await getProducts();
    const product = products.find(p => p.sku === sku);
    if (product) {
      return product;
    }
    const response = await api.get(`/products/${sku}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const getProductsByCategory = async (categoryId) => {
  const response = await api.get(`/categories/${categoryId}/products`);
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;

};


