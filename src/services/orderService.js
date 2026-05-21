import api from './api';

export default {
  async checkout() {
    const response = await api.post('/orders');
    return response.data; // { id, status, total_price }
  },

  async getAll() {
    const response = await api.get('/orders');
    return response.data; // [ { id, status, total_price, created_at } ]
  },

  async getById(id) {
    const response = await api.get(`/orders/${id}`);
    return response.data; // { id, status, total_price, items: [...] }
  }
};
