import axios from 'axios';

const api = axios.create({
  // En producción apuntaría a la API real, en desarrollo a localhost:3000
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de peticiones para adjuntar el Bearer Token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nebri_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuestas para manejar errores globales (ej: 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si el token expira o es inválido, limpiamos localStorage y forzamos recarga
      localStorage.removeItem('nebri_token');
      localStorage.removeItem('nebri_user');
      window.dispatchEvent(new Event('auth-expired'));
    }
    return Promise.reject(error.response ? error.response.data : error);
  }
);

export default api;
