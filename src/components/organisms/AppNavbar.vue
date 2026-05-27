<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/store/auth'
import SearchBar from '@/components/molecules/SearchBar.vue'
import BaseBadge from '@/components/atoms/BaseBadge.vue'

defineProps({
  cartCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['search', 'navigate'])

const authStore = useAuthStore()
const { isAuthenticated, user } = storeToRefs(authStore)

const isMobileMenuOpen = ref(false)

const handleSearch = (query) => {
  emit('search', query)
}

const handleNavigation = (destination) => {
  emit('navigate', destination)
  isMobileMenuOpen.value = false
}

const handleLogout = async () => {
  await authStore.logout()
  isMobileMenuOpen.value = false
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
</script>

<template>
  <header class="app-navbar-header">
    <nav class="app-navbar" aria-label="Navegación principal">
      <!-- Logo de la Marca -->
      <div class="navbar-logo" @click="handleNavigation('home')" role="button" tabindex="0">
        <span class="logo-text">Nebri<span class="logo-highlight">Amazon</span></span>
      </div>

      <!-- Barra de Búsqueda (Escritorio) -->
      <div class="navbar-search-desktop">
        <SearchBar @search="handleSearch" />
      </div>

      <!-- Menú de Acciones de Usuario y Carrito -->
      <div class="navbar-actions" :class="{ 'mobile-open': isMobileMenuOpen }">
        <div 
          v-if="!isAuthenticated" 
          class="action-item" 
          @click="handleNavigation('Login')" 
          role="button" 
          tabindex="0"
          aria-label="Iniciar sesión"
        >
          <span class="action-subtext">Hola, Identifícate</span>
          <span class="action-text">Cuenta y Listas</span>
        </div>
        <div 
          v-else 
          class="action-item user-profile-action" 
          @click="handleLogout" 
          role="button" 
          tabindex="0"
          aria-label="Cerrar sesión"
        >
          <span class="action-subtext">Hola, {{ user?.name }}</span>
          <span class="action-text logout-btn">Cerrar Sesión</span>
        </div>

        <div class="action-item" @click="handleNavigation('orders')" role="button" tabindex="0">
          <span class="action-subtext">Devoluciones</span>
          <span class="action-text">& Pedidos</span>
        </div>

        <!-- Carrito de Compras -->
        <div 
          class="cart-widget" 
          @click="handleNavigation('cart')" 
          role="button" 
          tabindex="0" 
          aria-label="Ver carrito"
        >
          <div class="cart-icon-wrapper">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              stroke-width="2" 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              class="cart-icon"
            >
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <BaseBadge :count="cartCount" />
          </div>
          <span class="cart-text">Carrito</span>
        </div>
      </div>

      <!-- Botón Menú Hamburguesa (Móvil) -->
      <button 
        class="mobile-menu-toggle" 
        @click="toggleMobileMenu" 
        :aria-expanded="isMobileMenuOpen"
        aria-label="Alternar menú de navegación"
      >
        <span class="burger-bar" :class="{ 'open': isMobileMenuOpen }"></span>
        <span class="burger-bar" :class="{ 'open': isMobileMenuOpen }"></span>
        <span class="burger-bar" :class="{ 'open': isMobileMenuOpen }"></span>
      </button>
    </nav>

    <!-- Barra de Búsqueda (Móvil) -->
    <div class="navbar-search-mobile">
      <SearchBar @search="handleSearch" />
    </div>
  </header>
</template>

<style scoped>
.app-navbar-header {
  background-color: var(--color-primary);
  color: var(--color-surface);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: var(--shadow-md);
  padding: 0.5rem 1rem;
}

.app-navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  gap: 1.5rem;
  height: 56px;
}

/* Logo */
.navbar-logo {
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  outline: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid transparent;
  transition: border-color var(--transition-fast);
}

.navbar-logo:focus-visible,
.navbar-logo:hover {
  border-color: var(--color-surface);
}

.logo-text {
  font-size: 1.4rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.logo-highlight {
  color: var(--color-accent);
}

/* Contenedores de Búsqueda */
.navbar-search-desktop {
  flex: 1;
  display: flex;
  justify-content: center;
}

.navbar-search-mobile {
  display: none;
  padding: 0.5rem 0;
}

/* Acciones */
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.action-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid transparent;
  transition: border-color var(--transition-fast);
  outline: none;
}

.action-item:focus-visible,
.action-item:hover {
  border-color: var(--color-surface);
}

.action-subtext {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-weight: 400;
}

.action-text {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.2px;
}

/* Carrito */
.cart-widget {
  display: flex;
  align-items: flex-end;
  gap: 0.35rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid transparent;
  transition: border-color var(--transition-fast);
  outline: none;
}

.cart-widget:focus-visible,
.cart-widget:hover {
  border-color: var(--color-surface);
}

.cart-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.cart-icon {
  width: 24px;
  height: 24px;
  stroke: var(--color-surface);
}

.cart-text {
  font-size: 0.85rem;
  font-weight: 700;
  align-self: flex-end;
  padding-bottom: 2px;
}

/* Botón Hamburguesa */
.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 18px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  outline: none;
}

.burger-bar {
  width: 100%;
  height: 2px;
  background-color: var(--color-surface);
  transition: transform var(--transition-fast), opacity var(--transition-fast);
}

.burger-bar.open:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.burger-bar.open:nth-child(2) {
  opacity: 0;
}

.burger-bar.open:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

/* Estilos de Responsividad (Media Queries) */
@media (max-width: 768px) {
  .navbar-search-desktop {
    display: none;
  }

  .navbar-search-mobile {
    display: block;
  }

  .mobile-menu-toggle {
    display: flex;
  }

  .navbar-actions {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: stretch;
    background-color: var(--color-primary-light);
    padding: 1rem;
    gap: 1rem;
    box-shadow: var(--shadow-lg);
  }

  .navbar-actions.mobile-open {
    display: flex;
  }

  .action-item, .cart-widget {
    padding: 0.75rem 1rem;
    background-color: rgba(255, 255, 255, 0.05);
  }

  .action-item:hover, .cart-widget:hover {
    border-color: transparent;
    background-color: rgba(255, 255, 255, 0.1);
  }
}
</style>
