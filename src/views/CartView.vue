<template>
  <div class="cart-view container">
    <h2 class="view-title">Tu Cesta de Compras</h2>

    <!-- Carrito Vacío -->
    <div v-if="cartStore.items.length === 0" class="empty-cart float-in">
      <span class="empty-icon">🛒</span>
      <h3>Tu cesta de NebriAmazon está vacía</h3>
      <p>Explora nuestro catálogo para encontrar ofertas exclusivas y productos seleccionados a mano.</p>
      <router-link :to="{ name: 'Catalog' }">
        <BaseButton variant="primary">Ir al catálogo de productos</BaseButton>
      </router-link>
    </div>

    <!-- Contenido del Carrito -->
    <div v-else class="cart-layout">
      <!-- Listado de Artículos -->
      <div class="items-column">
        <CartItem
          v-for="item in cartStore.items"
          :key="item.id"
          :item="item"
        />
      </div>

      <!-- Panel de Resumen Financiero -->
      <aside class="summary-column float-in">
        <h3 class="summary-title">Resumen de Compra</h3>
        
        <div class="summary-row">
          <span>Subtotal ({{ cartStore.totalItemsCount }} uds):</span>
          <span class="value">{{ formatPrice(cartStore.subtotal) }}</span>
        </div>
        
        <div class="summary-row">
          <span>Impuestos (IVA 21%):</span>
          <span class="value">{{ formatPrice(cartStore.taxAmount) }}</span>
        </div>

        <div class="divider"></div>

        <div class="summary-row total-row">
          <span>Importe Total:</span>
          <span class="total-value">{{ formatPrice(cartStore.total) }}</span>
        </div>

        <!-- Botón de Pago -->
        <BaseButton variant="primary" @click="proceedToCheckout" class="checkout-btn">
          Proceder al Pago
        </BaseButton>
        
        <span v-if="!authStore.isAuthenticated" class="auth-warning">
          ⚠️ Deberás identificarte para poder completar la orden.
        </span>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import CartItem from '@/components/molecules/CartItem.vue';
import BaseButton from '@/components/atoms/BaseButton.vue';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);
};

const proceedToCheckout = () => {
  if (authStore.isAuthenticated) {
    router.push({ name: 'Checkout' });
  } else {
    // Redirige al login guardando la ruta de retorno
    router.push({ name: 'Login', query: { redirect: '/checkout' } });
  }
};
</script>

<style scoped>
.cart-view {
  padding: 30px 20px 60px;
  min-height: calc(100vh - 70px - 60px);
}

.view-title {
  font-family: var(--font-title);
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 24px;
}

.empty-cart {
  text-align: center;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 80px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-sm);
  max-width: 650px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 4rem;
}

.empty-cart h3 {
  font-family: var(--font-title);
  font-size: 1.4rem;
  color: var(--color-primary);
}

.empty-cart p {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  max-width: 450px;
  margin-bottom: 8px;
}

.cart-layout {
  display: grid;
  grid-template-columns: minmax(300px, 1.8fr) minmax(280px, 1.2fr);
  gap: 30px;
  align-items: flex-start;
}

.items-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-column {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-title {
  font-family: var(--font-title);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 12px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
}

.value {
  font-weight: 600;
  color: var(--color-text);
}

.divider {
  height: 1px;
  background-color: var(--color-border);
  width: 100%;
}

.total-row {
  font-family: var(--font-title);
  font-size: 1.15rem;
  font-weight: 700;
}

.total-value {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--color-accent);
}

.checkout-btn {
  width: 100%;
  padding: 12px !important;
  font-size: 1rem !important;
  margin-top: 8px;
}

.auth-warning {
  font-size: 0.8rem;
  color: var(--color-warning);
  text-align: center;
  font-weight: 500;
}

@media (max-width: 768px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }
}
</style>
