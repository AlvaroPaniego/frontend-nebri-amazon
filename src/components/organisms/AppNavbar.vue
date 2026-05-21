<template>
  <nav class="app-navbar">
    <div class="nav-container container">
      <!-- Logo de la marca -->
      <router-link :to="{ name: 'Home' }" class="nav-logo">
        <span class="logo-nebri">Nebri</span><span class="logo-amazon">Amazon</span>🛍️
      </router-link>
      
      <!-- Barra de búsqueda reactiva -->
      <div class="nav-search-bar">
        <input
          type="text"
          placeholder="Busca productos por nombre o SKU..."
          v-model="searchQuery"
          @keyup.enter="triggerSearch"
          class="search-input"
        />
        <button @click="triggerSearch" class="search-btn" aria-label="Buscar">
          🔍
        </button>
      </div>
      
      <!-- Enlaces de Navegación -->
      <div class="nav-links">
        <router-link :to="{ name: 'Catalog' }" class="nav-link">Catálogo</router-link>
        
        <!-- Vista Admin (Solo si es Administrador) -->
        <router-link
          v-if="authStore.isAdmin"
          :to="{ name: 'AdminDashboard' }"
          class="nav-link admin-badge"
        >
          Admin Console
        </router-link>
        
        <!-- Autenticación y Cuentas -->
        <div class="auth-section">
          <template v-if="authStore.isAuthenticated">
            <span class="welcome-text">Hola, <strong>{{ authStore.user?.name }}</strong></span>
            <button @click="handleLogout" class="logout-btn">Salir</button>
          </template>
          <template v-else>
            <router-link :to="{ name: 'Login' }" class="nav-link font-bold">Identifícate</router-link>
          </template>
        </div>
        
        <!-- Icono de Carrito con Badge reactivo -->
        <router-link :to="{ name: 'Cart' }" class="cart-icon-wrapper" aria-label="Ver cesta">
          <span class="cart-icon">🛒</span>
          <BaseBadge :count="cartStore.totalItemsCount" />
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { useProductStore } from '@/store/products';
import BaseBadge from '../atoms/BaseBadge.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const cartStore = useCartStore();
const productStore = useProductStore();

const searchQuery = ref(productStore.filters.searchQuery);

// Sincroniza la barra con el store cuando los filtros se limpian en otras vistas
watch(() => productStore.filters.searchQuery, (newVal) => {
  searchQuery.value = newVal;
});

const triggerSearch = () => {
  productStore.setSearchQuery(searchQuery.value);
  if (route.name !== 'Catalog') {
    router.push({ name: 'Catalog' });
  }
};

const handleLogout = () => {
  authStore.logout();
  cartStore.clearCart();
  router.push({ name: 'Home' });
};
</script>

<style scoped>
.app-navbar {
  background-color: var(--color-primary);
  color: var(--color-surface);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
  padding: 12px 0;
  min-height: 70px;
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.nav-logo {
  font-family: var(--font-title);
  font-size: 1.45rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 4px;
}

.logo-nebri {
  color: var(--color-surface);
}

.logo-amazon {
  color: var(--color-accent);
}

.nav-search-bar {
  display: flex;
  flex-grow: 1;
  max-width: 550px;
  background-color: var(--color-surface);
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 2px solid transparent;
  transition: border var(--transition-fast);
}

.nav-search-bar:focus-within {
  border-color: var(--color-accent);
}

.search-input {
  width: 100%;
  padding: 8px 16px;
  font-size: 0.9rem;
  color: var(--color-text);
  outline: none;
}

.search-btn {
  background-color: var(--color-accent);
  border: none;
  padding: 0 16px;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition-fast);
}

.search-btn:hover {
  background-color: var(--color-accent-hover);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-link {
  font-family: var(--font-title);
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-surface);
  transition: color var(--transition-fast);
}

.nav-link:hover {
  color: var(--color-accent);
}

.admin-badge {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.auth-section {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9rem;
}

.welcome-text {
  color: var(--color-border);
}

.logout-btn {
  color: var(--color-error);
  font-weight: 600;
  font-size: 0.85rem;
  transition: color var(--transition-fast);
}

.logout-btn:hover {
  color: hsl(0, 84%, 70%);
}

.cart-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.cart-icon {
  font-size: 1.5rem;
}

@media (max-width: 768px) {
  .nav-container {
    flex-wrap: wrap;
  }
  
  .nav-search-bar {
    order: 3;
    max-width: 100%;
    width: 100%;
  }
  
  .nav-links {
    gap: 16px;
  }
}
</style>
