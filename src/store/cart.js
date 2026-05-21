import { defineStore } from 'pinia';
import cartService from '@/services/cartService';
import { useAuthStore } from './auth';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('nebri_cart_items')) || [],
    loading: false
  }),

  getters: {
    totalItemsCount: (state) => {
      return state.items.reduce((sum, item) => sum + item.quantity, 0);
    },

    // Cálculos financieros precisos
    subtotal: (state) => {
      const value = state.items.reduce((sum, item) => {
        const price = Number(item.product.price) || 0;
        return sum + (price * item.quantity);
      }, 0);
      return Math.round(value * 100) / 100;
    },

    taxAmount() {
      // 21% IVA sobre el subtotal
      return Math.round((this.subtotal * 0.21) * 100) / 100;
    },

    total() {
      // Subtotal + IVA
      return Math.round((this.subtotal + this.taxAmount) * 100) / 100;
    }
  },

  actions: {
    async initializeCart() {
      const authStore = useAuthStore();
      if (authStore.isAuthenticated) {
        this.loading = true;
        try {
          const remoteCart = await cartService.getCart();
          // Combinación de ítems locales y remotos si aplica
          this.items = remoteCart.items;
          this.saveLocalStorage();
        } catch (error) {
          console.error('Error al recuperar el carrito del servidor:', error);
        } finally {
          this.loading = false;
        }
      }
    },

    async addItem(product, quantity = 1) {
      const authStore = useAuthStore();
      const existingItem = this.items.find(item => item.product.id === product.id);

      if (existingItem) {
        const nextQuantity = existingItem.quantity + quantity;
        if (product.stock !== undefined && nextQuantity > product.stock) {
          throw new Error(`Stock insuficiente. Solo quedan ${product.stock} unidades.`);
        }
        existingItem.quantity = nextQuantity;
        
        if (authStore.isAuthenticated) {
          this.loading = true;
          try {
            await cartService.updateCartItem(existingItem.id, existingItem.quantity);
          } finally {
            this.loading = false;
          }
        }
      } else {
        if (product.stock !== undefined && quantity > product.stock) {
          throw new Error(`Stock insuficiente. Solo quedan ${product.stock} unidades.`);
        }
        
        const newItem = {
          id: 'temp_' + Date.now(), // ID temporal local
          quantity,
          product
        };
        this.items.push(newItem);

        if (authStore.isAuthenticated) {
          this.loading = true;
          try {
            const addedItem = await cartService.addCartItem(product.id, quantity);
            // Reemplazamos ID temporal por el de la BD
            const index = this.items.findIndex(item => item.product.id === product.id);
            if (index !== -1) {
              this.items[index].id = addedItem.id;
            }
          } finally {
            this.loading = false;
          }
        }
      }
      this.saveLocalStorage();
    },

    async updateItemQuantity(itemId, quantity) {
      const authStore = useAuthStore();
      const item = this.items.find(item => item.id === itemId);
      if (!item) return;

      if (item.product.stock !== undefined && quantity > item.product.stock) {
        throw new Error(`Stock insuficiente. Solo quedan ${item.product.stock} unidades.`);
      }

      item.quantity = quantity;

      if (authStore.isAuthenticated && !String(itemId).startsWith('temp_')) {
        this.loading = true;
        try {
          await cartService.updateCartItem(itemId, quantity);
        } finally {
          this.loading = false;
        }
      }
      this.saveLocalStorage();
    },

    async removeItem(itemId) {
      const authStore = useAuthStore();
      this.items = this.items.filter(item => item.id !== itemId);

      if (authStore.isAuthenticated && !String(itemId).startsWith('temp_')) {
        this.loading = true;
        try {
          await cartService.removeCartItem(itemId);
        } finally {
          this.loading = false;
        }
      }
      this.saveLocalStorage();
    },

    clearCart() {
      this.items = [];
      this.saveLocalStorage();
    },

    saveLocalStorage() {
      localStorage.setItem('nebri_cart_items', JSON.stringify(this.items));
    }
  }
});
