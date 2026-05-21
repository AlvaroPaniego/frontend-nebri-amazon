<template>
  <div class="app-layout">
    <!-- Barra de Navegación Global -->
    <AppNavbar />

    <!-- Área de Contenido Principal con Transición de Vistas -->
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Widget del Chatbot Inteligente -->
    <ChatbotWidget />

    <!-- Pie de Página Semántico -->
    <footer class="app-footer">
      <div class="footer-container container">
        <div class="footer-brand">
          <h4>NebriAmazon 🛍️</h4>
          <p>La experiencia de compra digital definitiva, libre de overselling y potenciada por IA pasiva.</p>
        </div>
        <div class="footer-links">
          <div class="links-column">
            <h5>Compañía</h5>
            <a href="#">Sobre Nosotros</a>
            <a href="#">Contacto</a>
            <a href="#">Empleo</a>
          </div>
          <div class="links-column">
            <h5>Soporte</h5>
            <a href="#">Centro de Ayuda</a>
            <a href="#">Devoluciones</a>
            <a href="#">Políticas de Envío</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 NebriAmazon. Todos los derechos reservados. Diseñado artesanalmente con Vue 3 & CSS Vanilla.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import AppNavbar from '@/components/organisms/AppNavbar.vue';
import ChatbotWidget from '@/components/organisms/ChatbotWidget.vue';

const authStore = useAuthStore();
const cartStore = useCartStore();

const handleAuthExpired = () => {
  authStore.logout();
  cartStore.clearCart();
  alert('Tu sesión ha expirado por inactividad. Por favor, identifícate de nuevo.');
};

onMounted(async () => {
  // Escucha del evento global de expiración de sesión (despachado por Axios interceptor)
  window.addEventListener('auth-expired', handleAuthExpired);

  // Recupera datos del usuario y de la cesta si hay un token JWT válido persistido
  if (authStore.token) {
    await authStore.fetchCurrentUser();
    await cartStore.initializeCart();
  }
});

onUnmounted(() => {
  window.removeEventListener('auth-expired', handleAuthExpired);
});
</script>

<style>
/* Importación del CSS global */
@import './assets/main.css';

.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex-grow: 1;
}

/* Transiciones entre páginas (Fade suave) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-fast) ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Pie de Página */
.app-footer {
  background-color: var(--color-primary);
  color: var(--color-surface);
  border-top: 5px solid var(--color-accent);
  padding: 40px 0 20px;
  font-family: var(--font-body);
  margin-top: auto;
}

.footer-container {
  display: flex;
  justify-content: space-between;
  gap: 40px;
  flex-wrap: wrap;
}

.footer-brand {
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-brand h4 {
  font-family: var(--font-title);
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--color-accent);
}

.footer-brand p {
  font-size: 0.85rem;
  color: var(--color-border);
  line-height: 1.5;
}

.footer-links {
  display: flex;
  gap: 60px;
}

.links-column {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.links-column h5 {
  font-family: var(--font-title);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-surface);
  margin-bottom: 4px;
}

.links-column a {
  font-size: 0.85rem;
  color: var(--color-border);
  transition: color var(--transition-fast);
}

.links-column a:hover {
  color: var(--color-accent);
}

.footer-bottom {
  border-top: 1px solid var(--color-primary-light);
  margin-top: 40px;
  padding-top: 20px;
  text-align: center;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .footer-container {
    flex-direction: column;
    gap: 30px;
  }
  
  .footer-links {
    gap: 40px;
  }
}
</style>
