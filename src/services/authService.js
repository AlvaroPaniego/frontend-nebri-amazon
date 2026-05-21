import api from './api';

export default {
  async register(name, email, password) {
    const response = await api.post('/auth/register', { name, email, password });
    return response.data; // { user: { id, name, email, role }, token }
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data; // { user: { id, name, email, role }, token }
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data; // { id, name, email, role }
  }
};
