import { defineStore } from 'pinia';
import authService from '@/services/authService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('nebri_token') || null,
    user: JSON.parse(localStorage.getItem('nebri_user')) || null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin'
  },

  actions: {
    async register(name, email, password) {
      this.loading = true;
      try {
        const data = await authService.register(name, email, password);
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('nebri_token', data.token);
        localStorage.setItem('nebri_user', JSON.stringify(data.user));
        return data.user;
      } finally {
        this.loading = false;
      }
    },

    async login(email, password) {
      this.loading = true;
      try {
        const data = await authService.login(email, password);
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('nebri_token', data.token);
        localStorage.setItem('nebri_user', JSON.stringify(data.user));
        return data.user;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('nebri_token');
      localStorage.removeItem('nebri_user');
    },

    async fetchCurrentUser() {
      if (!this.token) return;
      try {
        const user = await authService.getMe();
        this.user = user;
        localStorage.setItem('nebri_user', JSON.stringify(user));
      } catch (error) {
        this.logout();
      }
    }
  }
});
