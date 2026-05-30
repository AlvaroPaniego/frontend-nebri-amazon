import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getUserOrders } from '@/services/orderService';

export const useOrdersStore = defineStore('orders', () => {
  // =========================================================================
  // ESTADO (State)
  // =========================================================================
  const orders = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // =========================================================================
  // ACCIONES (Actions)
  // =========================================================================

  /**
   * fetchUserOrders - Carga el historial de pedidos del usuario autenticado.
   * Cambia loading a true, limpia el error previo y gestiona errores de red de forma limpia.
   * Garantiza que loading vuelva a false mediante try-catch-finally.
   */


  const fetchUserOrders = async () => {
    loading.value = true;
    error.value = null;

    try {
      const data = await getUserOrders();
      // Garantizar que data sea un array y ordenarlo de forma decreciente por fecha como salvaguarda
      if (Array.isArray(data)) {
        orders.value = [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      } else {
        orders.value = [];
      }
    } catch (err) {
      // Manejar el error de forma segura y clara para el usuario final
      error.value = err?.message || err?.error || 'No se pudo conectar con el servidor. Revisa tu conexión de red.';
      orders.value = []; // Evitamos dejar datos inconsistentes si falla la petición
      throw err;
    } finally {
      loading.value = false;
    }
  };




  /**
   * resetState - Limpia el estado de pedidos (útil para el logout del usuario)
   */
  const resetState = () => {
    orders.value = [];
    loading.value = false;
    error.value = null;
  };

  return {
    orders,
    loading,
    error,
    fetchUserOrders,
    resetState
  };
});
