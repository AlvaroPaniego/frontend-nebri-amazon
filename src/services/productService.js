import api from './api';

export default {
  async getAll(params = {}) {
    const response = await api.get('/products', { params });
    return response.data; // Array de productos [{ id, name, price, stock, sku, image_urls }]
  },

  async getById(id) {
    const response = await api.get(`/products/${id}`);
    return response.data; // { id, name, description, price, stock, sku, image_urls }
  },

  async create(productData) {
    const response = await api.post('/products', productData);
    return response.data;
  },

  async update(id, productData) {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  async delete(id) {
    const response = await api.delete(`/products/${id}`);
    return response.data; // { message: "Producto eliminado..." }
  }
};
