import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useCartStore } from './cart';
import api from '@/services/api';

export const useAuthStore = defineStore('auth', () => {
  // =========================================================================
  // ESTADO (State)
  // =========================================================================
  // token: Almacena el token JWT. Se inicializa recuperándolo de localStorage de forma segura.
  const token = ref(localStorage.getItem('auth_token') || null);

  // user: Objeto que contiene los datos del usuario autenticado (id, name, email, role).
  const user = ref(null);

  // loading: Booleano para manejar estados de carga y deshabilitar interacciones durante llamadas asíncronas.
  const loading = ref(false);

  // =========================================================================
  // GETTERS (Computed)
  // =========================================================================
  // isAuthenticated: Indica reactivamente si el usuario está autenticado en base a la presencia del token.
  const isAuthenticated = computed(() => !!token.value);

  // isAdmin: Retorna true si el rol del usuario actual es 'admin'.
  const isAdmin = computed(() => user.value?.role === 'admin');

  // =========================================================================
  // ACCIONES (Actions)
  // =========================================================================

  /**
   * login - Tarea 2 de la Iteración 2 (Roadmap, Apartado 8):
   * Gestión de inicio de sesión de usuario de forma segura conectada al API backend.
   * Envía las credenciales al backend, almacena el token JWT en el estado y en localStorage,
   * e inicializa el perfil en el estado. En la Iteración 4, sincronizará el carrito local con el backend.
   * 
   * @param {Object} credentials - Objeto con { email, password }
   * @returns {Promise<Object>} Datos del usuario autenticado
   */
  const login = async (credentials) => {
    if (!credentials || !credentials.email || !credentials.password) {
      throw new Error('El correo electrónico y la contraseña son obligatorios.');
    }

    loading.value = true;

    try {
      // Petición real al backend
      const response = await api.post('/auth/login', {
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password
      });

      const { user: userData, token: jwtToken } = response.data;

      // Actualización de estado y persistencia local
      token.value = jwtToken;
      localStorage.setItem('auth_token', jwtToken);
      user.value = userData;

      // Sincronización del carrito de compras local con el servidor al iniciar sesión
      const cartStore = useCartStore();
      await cartStore.initializeCart();

      return user.value;
    } catch (error) {
      const errorMessage = error?.error || error?.message || 'Error al iniciar sesión. Verifica tus credenciales.';
      throw new Error(errorMessage);
    } finally {
      loading.value = false;
    }
  };

  /**
   * register - Tarea 2 de la Iteración 2 (Roadmap, Apartado 8):
   * Registro de nuevos usuarios conectado al API backend.
   * Crea una nueva entidad en la plataforma y genera una sesión automática de inmediato.
   * 
   * @param {Object} userData - Objeto con { name, email, password }
   * @returns {Promise<Object>} Datos del usuario registrado y autenticado
   */
  const register = async (userData) => {
    if (!userData || !userData.name || !userData.email || !userData.password) {
      throw new Error('Todos los campos del formulario son obligatorios para el registro.');
    }

    loading.value = true;

    try {
      // Petición real al backend
      const response = await api.post('/auth/register', {
        name: userData.name.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password
      });

      const { user: newUserData, token: jwtToken } = response.data;

      // Actualización de estado y persistencia local
      token.value = jwtToken;
      localStorage.setItem('auth_token', jwtToken);
      user.value = newUserData;

      // Sincronización del carrito tras el registro
      const cartStore = useCartStore();
      await cartStore.initializeCart();

      return user.value;
    } catch (error) {
      const errorMessage = error?.error || error?.message || 'Error en el registro. Verifica los datos.';
      throw new Error(errorMessage);
    } finally {
      loading.value = false;
    }
  };

  /**
   * logout - Tarea 2 de la Iteración 2 (Roadmap, Apartado 8):
   * Cierre seguro de sesión del usuario.
   * Limpia el token y el perfil de usuario del estado y del localStorage,
   * y prepara el flujo para vaciar las tiendas asociadas y redirigir al catálogo.
   * 
   * @returns {Promise<boolean>} Confirmación de logout exitoso
   */
  const logout = async () => {
    loading.value = true;

    try {
      // Limpieza de estado de autenticación
      token.value = null;
      user.value = null;
      localStorage.removeItem('auth_token');

      // Vaciar por completo los stores de carrito y productos para evitar contaminación de datos
      const cartStore = useCartStore();
      await cartStore.clearCart();

      // Redirige al catálogo de forma segura y fluida usando el enrutador
      try {
        const routerModule = await import('@/router');
        const router = routerModule.default;
        if (router && typeof router.push === 'function') {
          await router.push('/catalog').catch(() => {
            // Manejo silencioso
          });
        }
      } catch (routerError) {
        // Fallback silencioso
      }

      return true;
    } finally {
      loading.value = false;
    }
  };

  /**
   * fetchCurrentUser - Tarea 5 de la Iteración 2 (Roadmap, Apartado 8):
   * Recupera la información del perfil del usuario validando el token persistido
   * contra el backend API al inicializar o recargar la aplicación.
   * 
   * @returns {Promise<Object>} Perfil del usuario cargado o error si el token es inválido
   */
  const fetchCurrentUser = async () => {
    if (!token.value) {
      throw new Error('No existe ningún token de sesión almacenado.');
    }

    loading.value = true;

    try {
      // Petición real al backend validando el token actual
      const response = await api.get('/auth/me');
      
      // La API puede devolver { id, name, ... } directamente o envuelto en { user: { ... } }
      user.value = response.data.user || response.data;

      // Sincronizar el carrito del usuario recuperado al inicializar o recargar la app
      const cartStore = useCartStore();
      await cartStore.initializeCart();

      return user.value;
    } catch (error) {
      // Ante cualquier error de autenticación (ej: token expirado 401), limpiamos sesión
      token.value = null;
      user.value = null;
      localStorage.removeItem('auth_token');
      throw error;
    } finally {
      loading.value = false;
    }
  };

  return {
    token,
    user,
    loading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    fetchCurrentUser
  };
});
