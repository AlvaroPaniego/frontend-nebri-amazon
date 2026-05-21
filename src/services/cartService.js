import api from './api';

export default {
  async getCart() {
    const response = await api.get('/cart');
    return response.data; // { id, items: [ { id, quantity, product } ] }
  },

  async addCartItem(productId, quantity) {
    const response = await api.post('/cart/items', { product_id: productId, quantity });
    return response.data; // { id, quantity, product_id }
  },

  async updateCartItem(itemId, quantity) {
    const response = await api.put(`/cart/items/${itemId}`, { quantity });
    return response.data; // { id, quantity }
  },

  async removeCartItem(itemId) {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data; // { message: "Artículo removido..." }
  }
};
