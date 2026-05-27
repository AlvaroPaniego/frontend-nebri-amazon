/**
 * src/services/api.js
 * ─────────────────────────────────────────────────────────────
 * Iteración 5 (Fase 5) — Capa de Red Base
 *
 * Cliente Axios centralizado para todas las peticiones REST de la
 * aplicación. Gestiona automáticamente:
 *  - La inyección de la cabecera Authorization JWT (interceptor de petición).
 *  - La captura global de errores HTTP críticos (interceptor de respuesta).
 *
 * Todos los servicios de la aplicación (orderService, cartService, etc.)
 * importan ESTE cliente, nunca instancian Axios directamente.
 * Así, toda la lógica de transporte queda aislada en un único punto.
 */

import axios from 'axios';
import { useAuthStore } from '@/store/auth';



// ─── Instancia base ────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Interceptor de Petición: adjunta Bearer Token ─────────────
api.interceptors.request.use(
  (config) => {
    // useAuthStore se invoca en tiempo de ejecución (no en el módulo) para
    // evitar el error "getActivePinia() called before createPinia()"
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Interceptor de Respuesta: manejo unificado de errores HTTP ─
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const authStore = useAuthStore();

    // 401 → token expirado/inválido → cierre de sesión seguro automático
    if (error.response?.status === 401) {
      alert('Error de autenticación. Tu sesión ha expirado o no es válida. Por favor, vuelve a iniciar sesión.');
      authStore.logout();
    }

    // Propagamos solo la carga útil del error para que los servicios
    // puedan acceder directamente a error.message, error.code, etc.
    return Promise.reject(error.response?.data ?? error);
  },
);

export default api;
