import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useCartStore } from './cart';

// Helper de utilidad para simular latencia de red de forma limpia sin callback hell (Clean Code)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
   * Gestión de inicio de sesión de usuario de forma segura.
   * Envía las credenciales al backend, almacena el token JWT en el estado y en localStorage,
   * e inicializa el perfil en el estado. En la Iteración 4, sincronizará el carrito local con el backend.
   * Refactorizado: Eliminado el Promise Constructor Anti-pattern para aplanar la asincronía.
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
      // Simulación limpia de la asincronía de la llamada a la API con un retraso de 800ms
      await delay(800);

      const email = credentials.email.trim().toLowerCase();
      const password = credentials.password;

      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres.');
      }

      // Generación de un token JWT mockeado seguro basado en el email
      const mockToken = `mock-jwt-token-${btoa(email)}`;

      // Actualización de estado y persistencia local
      token.value = mockToken;
      localStorage.setItem('auth_token', mockToken);

      // Asignación de rol de administrador si el correo contiene 'admin'
      const role = email.includes('admin') ? 'admin' : 'user';
      const name = email.split('@')[0];

      user.value = {
        id: 1, // ID ficticio
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email: email,
        role: role
      };

      // Tarea de la Iteración 4 (Roadmap, Apartado 8):
      // Sincronización del carrito de compras local con el servidor al iniciar sesión
      const cartStore = useCartStore();
      await cartStore.initializeCart();

      return user.value;
    } finally {
      loading.value = false;
    }
  };

  /**
   * register - Tarea 2 de la Iteración 2 (Roadmap, Apartado 8):
   * Registro de nuevos usuarios y login automático de forma fluida.
   * Crea una nueva entidad en la plataforma y genera una sesión automática de inmediato.
   * Refactorizado: Eliminado el Promise Constructor Anti-pattern para aplanar la asincronía.
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
      // Simula el procesamiento asíncrono en backend con 800ms de retraso
      await delay(800);

      const name = userData.name.trim();
      const email = userData.email.trim().toLowerCase();
      const password = userData.password;

      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres.');
      }

      // Generación automática de sesión post-registro
      const mockToken = `mock-jwt-token-${btoa(email)}`;

      token.value = mockToken;
      localStorage.setItem('auth_token', mockToken);

      user.value = {
        id: Date.now(), // Generación de un ID dinámico simulación base de datos
        name: name,
        email: email,
        role: 'user' // Por defecto los registros son de tipo cliente estándar
      };

      // Tarea de la Iteración 4 (Roadmap, Apartado 8):
      // Sincronización del carrito tras el registro y login automático de forma fluida
      const cartStore = useCartStore();
      await cartStore.initializeCart();

      return user.value;
    } finally {
      loading.value = false;
    }
  };

  /**
   * logout - Tarea 2 de la Iteración 2 (Roadmap, Apartado 8):
   * Cierre seguro de sesión del usuario.
   * Limpia el token y el perfil de usuario del estado y del localStorage,
   * y prepara el flujo para vaciar las tiendas asociadas y redirigir al catálogo.
   * Refactorizado: Eliminado el Promise Constructor Anti-pattern para aplanar la asincronía.
   * 
   * @returns {Promise<boolean>} Confirmación de logout exitoso
   */
  const logout = async () => {
    loading.value = true;

    try {
      // Simulación de asincronía rápida para el cierre de sesión en backend (400ms)
      await delay(400);

      // Limpieza de estado de autenticación
      token.value = null;
      user.value = null;
      localStorage.removeItem('auth_token');

      // Tarea de las Iteraciones 3 y 4 (Roadmap, Apartado 8):
      // Vaciar por completo los stores de carrito y productos para evitar contaminación de datos entre sesiones
      const cartStore = useCartStore();
      await cartStore.clearCart();
      // const productStore = useProductStore();
      // if (productStore && typeof productStore.resetState === 'function') { productStore.resetState(); }

      // Tareas de la Iteración 2 (Apartado 7 y 8):
      // Redirige al catálogo de forma segura y fluida usando el enrutador
      // Importación dinámica segura para evitar referencias circulares tempranas en Vue/Pinia
      try {
        const routerModule = await import('@/router');
        const router = routerModule.default;
        if (router && typeof router.push === 'function') {
          await router.push('/catalog').catch(() => {
            // Manejo silencioso en caso de estar en un entorno sin rutas activas o test
          });
        }
      } catch (routerError) {
        // Fallback silencioso si el router no se ha configurado aún o en entorno de test
      }

      return true;
    } finally {
      loading.value = false;
    }
  };

  /**
   * fetchCurrentUser - Tarea 5 de la Iteración 2 (Roadmap, Apartado 8):
   * Recupera la información del perfil del usuario si hay un token persistido
   * en localStorage al inicializar o recargar la aplicación.
   * Es la pieza clave que alimenta al Navigation Guard global (Apartado 7).
   * Refactorizado: Eliminado el Promise Constructor Anti-pattern para aplanar la asincronía.
   * 
   * @returns {Promise<Object>} Perfil del usuario cargado o error si el token es inválido
   */
  const fetchCurrentUser = async () => {
    if (!token.value) {
      throw new Error('No existe ningún token de sesión almacenado.');
    }

    loading.value = true;

    try {
      // Simulación de petición de red '/api/auth/me' con 600ms de latencia
      await delay(600);

      const currentToken = token.value;

      if (currentToken.startsWith('mock-jwt-token-')) {
        const encodedEmail = currentToken.replace('mock-jwt-token-', '');
        const email = atob(encodedEmail);
        const role = email.includes('admin') ? 'admin' : 'user';
        const namePart = email.split('@')[0];
        const name = namePart.charAt(0).toUpperCase() + namePart.slice(1);

        user.value = {
          id: 1,
          name: name,
          email: email,
          role: role
        };

        // Sincronizar el carrito del usuario recuperado al inicializar o recargar la app
        const cartStore = useCartStore();
        await cartStore.initializeCart();

        return user.value;
      } else {
        // Token inválido o corrupto -> Forzar cierre de sesión seguro
        throw new Error('El token de sesión no es válido o ha expirado.');
      }
    } catch (error) {
      // Ante cualquier error de autenticación persistida, hacemos un logout limpio y prolijo
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
