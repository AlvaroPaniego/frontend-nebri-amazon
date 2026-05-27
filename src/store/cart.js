import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useAuthStore } from './auth';
import * as cartService from '@/services/cartService';

// Generador de UUID v4 estándar para identificar de forma segura el carrito y los artículos
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const useCartStore = defineStore('cart', () => {
  // =========================================================================
  // ESTADO (State) - HITO 4 / Iteración 4 (Fase 4)
  // =========================================================================
  
  // cartId: UUID único para persistir la identidad del carrito de compras
  const cartId = ref(localStorage.getItem('nebriamazon_cart_id') || '');
  if (!cartId.value) {
    cartId.value = generateUUID();
    localStorage.setItem('nebriamazon_cart_id', cartId.value);
  }

  // items: Array reactivo de artículos agregados a la cesta
  // Formato: [ { id, quantity, product: { id, name, price, stock, sku, image_urls } } ]
  const items = ref([]);

  // loading: Booleano reactivo para gestionar spinners de actualización visual
  const loading = ref(false);

  // =========================================================================
  // PERSISTENCIA TRANSPARENTE EN LOCALSTORAGE (Navegación Anónima)
  // =========================================================================
  
  // Carga defensiva del estado persistido localmente
  const loadLocalItems = () => {
    try {
      const storedItems = localStorage.getItem('nebriamazon_cart_items');
      return storedItems ? JSON.parse(storedItems) : [];
    } catch (error) {
      console.error('Error al inicializar los artículos del carrito desde LocalStorage:', error);
      return [];
    }
  };

  // Watch reactivo para guardar de forma transparente en LocalStorage cuando el usuario navega anónimo
  watch(
    items,
    (newItems) => {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) {
        localStorage.setItem('nebriamazon_cart_items', JSON.stringify(newItems));
      }
    },
    { deep: true }
  );

  // =========================================================================
  // GETTERS FINANCIEROS (Iteración 4 - Control Absoluto de Coma Flotante)
  // =========================================================================
  
  // totalItemsCount: Sumatorio entero de todas las cantidades añadidas
  const totalItemsCount = computed(() => {
    return items.value.reduce((total, item) => total + (item.quantity || 0), 0);
  });

  // Cálculo exacto en céntimos (escalado entero) para blindar la aritmética contra imprecisiones binarias en JS
  const subtotalCents = computed(() => {
    return items.value.reduce((acc, item) => {
      const priceFloat = parseFloat(item.product?.price);
      if (isNaN(priceFloat)) return acc;
      // Escalado a centavos para evitar la distorsión del punto flotante
      const priceCents = Math.round(priceFloat * 100);
      return acc + (priceCents * item.quantity);
    }, 0);
  });

  // subtotal: Sumatorio exacto en formato float de producto.price * quantity
  const subtotal = computed(() => {
    return Number((subtotalCents.value / 100).toFixed(2));
  });

  // taxAmount: Cálculo aislado y preciso del IVA del 21% aplicado sobre el subtotal exacto
  const taxAmount = computed(() => {
    const taxCents = Math.round(subtotalCents.value * 0.21);
    return Number((taxCents / 100).toFixed(2));
  });

  // total: Suma exacta y definitiva de subtotal + taxAmount operando de forma aislada
  const total = computed(() => {
    const taxCents = Math.round(subtotalCents.value * 0.21);
    const totalCents = subtotalCents.value + taxCents;
    return Number((totalCents / 100).toFixed(2));
  });

  // =========================================================================
  // ACCIONES (Actions) - Flujo Híbrido y Persistencia Asíncrona
  // =========================================================================

  /**
   * initializeCart - Tarea 1 de la Iteración 4 (Fase 4):
   * Carga la cesta desde LocalStorage si el usuario está anónimo. Prepara el flujo para
   * la futura integración híbrida con el backend (/api/cart) mediante cartService.js.
   */
  const initializeCart = async () => {
    const authStore = useAuthStore();
    loading.value = true;
    
    try {
      if (!authStore.isAuthenticated) {
        items.value = loadLocalItems();
      } else {
        const localItems = loadLocalItems();
        try {
          const remoteCart = await cartService.syncCart(cartId.value, localItems);
          items.value = remoteCart.items || [];
        } catch(e) {
          console.error("Error sincronizando", e);
          items.value = localItems;
        }
      }
    } catch (error) {
      console.error('Error al inicializar el estado del carrito:', error);
    } finally {
      loading.value = false;
    }
  };

  /**
   * addItem - Tarea 1 de la Iteración 4 (Fase 4):
   * Valida preventivamente el stock disponible y añade el producto o incrementa su cantidad.
   * Deja el espacio listo para despachar la petición POST si el usuario está autenticado.
   * 
   * @param {Object} product - El producto a añadir { id, name, price, stock, sku, image_urls }
   * @param {number} quantity - La cantidad a añadir
   */
  const addItem = async (product, quantity = 1) => {
    if (!product || !product.id) {
      throw new Error('El producto especificado no es válido.');
    }
    if (quantity <= 0) {
      throw new Error('La cantidad a añadir debe ser superior a cero.');
    }

    const existingItem = items.value.find(item => item.product.id === product.id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const targetQuantity = currentQuantity + quantity;

    // Validación preventiva de stock
    if (targetQuantity > product.stock) {
      throw new Error(`Stock insuficiente. Solo quedan ${product.stock} unidades de este producto y ya tienes ${currentQuantity} en el carrito.`);
    }

    loading.value = true;
    try {
      if (existingItem) {
        existingItem.quantity = targetQuantity;
      } else {
        items.value.push({
          id: generateUUID(),
          quantity: quantity,
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            stock: product.stock,
            sku: product.sku,
            image_urls: product.image_urls
          }
        });
      }

      const authStore = useAuthStore();
      if (authStore.isAuthenticated) {
        try {
          await cartService.addCartItem(cartId.value, product.id, quantity);
        } catch(e) {
          console.error("Error al añadir en el backend", e);
        }
      } else {
        localStorage.setItem('nebriamazon_cart_items', JSON.stringify(items.value));
      }
    } finally {
      loading.value = false;
    }
  };

  /**
   * updateItemQuantity - Tarea 1 de la Iteración 4 (Fase 4):
   * Modifica localmente la cantidad del artículo validando stock.
   * Si la cantidad es 0 o menor, se elimina limpiamente el artículo del carrito.
   * 
   * @param {string} itemId - ID del ítem en la cesta
   * @param {number} newQuantity - Nueva cantidad deseada
   */
  const updateItemQuantity = async (itemId, newQuantity) => {
    const itemIndex = items.value.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      throw new Error('El artículo especificado no está en el carrito.');
    }

    const item = items.value[itemIndex];

    if (newQuantity <= 0) {
      await removeItem(itemId);
      return;
    }

    // Validación defensiva contra stock real
    if (newQuantity > item.product.stock) {
      throw new Error(`Stock insuficiente. Solo quedan ${item.product.stock} unidades de este producto.`);
    }

    loading.value = true;
    try {
      item.quantity = newQuantity;

      const authStore = useAuthStore();
      if (authStore.isAuthenticated) {
        try {
          await cartService.updateCartItem(cartId.value, itemId, newQuantity);
        } catch(e) {
          console.error("Error al actualizar en el backend", e);
        }
      } else {
        localStorage.setItem('nebriamazon_cart_items', JSON.stringify(items.value));
      }
    } finally {
      loading.value = false;
    }
  };

  /**
   * removeItem - Tarea 1 de la Iteración 4 (Fase 4):
   * Elimina localmente un ítem del carrito limpiando la colección de forma defensiva.
   * 
   * @param {string} itemId - ID del ítem a remover
   */
  const removeItem = async (itemId) => {
    const itemIndex = items.value.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;

    loading.value = true;
    try {
      items.value.splice(itemIndex, 1);

      const authStore = useAuthStore();
      if (authStore.isAuthenticated) {
        try {
          await cartService.removeCartItem(cartId.value, itemId);
        } catch(e) {
          console.error("Error al eliminar en el backend", e);
        }
      } else {
        localStorage.setItem('nebriamazon_cart_items', JSON.stringify(items.value));
      }
    } finally {
      loading.value = false;
    }
  };

  /**
   * clearCart - Tarea 1 de la Iteración 4 (Fase 4):
   * Vacía la cesta por completo localmente y purga el almacenamiento en LocalStorage.
   */
  const clearCart = async () => {
    loading.value = true;
    try {
      items.value = [];
      localStorage.removeItem('nebriamazon_cart_items');

      const authStore = useAuthStore();
      if (authStore.isAuthenticated) {
        try {
          await cartService.clearCart(cartId.value);
        } catch(e) {
          console.error("Error al limpiar en el backend", e);
        }
      }
    } finally {
      loading.value = false;
    }
  };

  return {
    cartId,
    items,
    loading,
    totalItemsCount,
    subtotal,
    taxAmount,
    total,
    initializeCart,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart
  };
});
