<script setup>
/**
 * src/views/HomeView.vue
 * ─────────────────────────────────────────────────────────────
 * Iteración 7 (Fase 7) — Orquestación de la Vista Principal
 *
 * Cascarón estructural que ensambla el layout raíz de la página
 * de inicio de NebriAmazon. Sus únicas responsabilidades son:
 *
 *   1. Montar semánticamente los organismos visuales.
 *   2. Disparar las acciones de inicialización de los stores de Pinia.
 *
 * PROHIBICIONES (Principio de Responsabilidad Única – SRP):
 *   ✗ Importaciones de Axios o llamadas HTTP directas.
 *   ✗ Mutaciones de estado fuera de las acciones de Pinia.
 *   ✗ Lógica de negocio o cálculos de dominio.
 */

import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

// ─── IMPORTACIONES CORREGIDAS  ───
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { useProductStore } from '@/store/products';

import AppNavbar from '@/components/organisms/AppNavbar.vue';
import ChatbotWidget from '@/components/organisms/ChatbotWidget.vue';
import ProductGrid from '@/components/organisms/ProductGrid.vue';
// He comentado CategoryGrid temporalmente hasta que crees el archivo físico
//import CategoryGrid from '@/components/organisms/CategoryGrid.vue';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const productStore = useProductStore();

const { totalItemsCount } = storeToRefs(cartStore);
const { isAuthenticated, user } = storeToRefs(authStore);

// ─── Ciclo de Vida: Inicialización Transparente ───────────────
onMounted(initializeSession);

/**
 * Inicializa el estado de sesión y carrito al montar la vista.
 * Detecta token JWT persistido en localStorage y reconstitye
 * el perfil del usuario antes de cualquier renderizado reactivo.
 */
async function initializeSession() {
  await restoreUserSession();
  await cartStore.initializeCart();
  productStore.fetchProducts();
  productStore.fetchCategories();
}

/**
 * Verifica si existe un token JWT almacenado localmente.
 * Si existe pero no hay datos de usuario en el estado, los recupera.
 */
async function restoreUserSession() {
  if (authStore.token && !authStore.user) {
    try {
      await authStore.fetchCurrentUser();
    } catch {
      // Token inválido o expirado — el store ya maneja el logout limpiamente
    }
  }
}

// ─── Navegación Semántica Declarativa ─────────────────────────

const goToCatalog = () => router.push({ name: 'Catalog' });
const goToLogin = () => router.push({ name: 'Login' });
const goToRegister = () => router.push({ name: 'Register' });
const goToCart = () => router.push({ name: 'Cart' });

const handleNavigation = (destination) => {
  if (destination === 'Login') {
    goToLogin();
  } else if (destination === 'Catalog') {
    goToCatalog();
  } else if (destination === 'cart') {
    goToCart();
  }
};


</script>

<template>
  <div class="home-layout">

    <!-- ══ CABECERA GLOBAL ══════════════════════════════════════ -->
    <!-- AppNavbar gestiona su propio estado interno (búsqueda, menú  -->
    <!-- móvil). Solo necesita el conteo del carrito para el BaseBadge -->
    <AppNavbar 
       :cart-count="totalItemsCount"
       @navigate="handleNavigation"
     />

    <!-- ══ CONTENIDO PRINCIPAL ══════════════════════════════════ -->
    <main class="home-container" id="main-content" tabindex="-1">

      <!-- ── SECCIÓN HERO ─────────────────────────────────────── -->
      <section class="hero-section" aria-labelledby="hero-heading">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="badge-dot" aria-hidden="true"></span>
            Experiencia de compra premium
          </div>

          <h1 id="hero-heading" class="hero-title">
            Bienvenido a
            <span class="hero-brand">
              Nebri<span class="brand-accent">Amazon</span>
            </span>
          </h1>

          <p class="hero-subtitle">
            Descubre los mejores productos con envíos ultra rápidos,
            precios inmejorables y un asistente virtual siempre disponible.
          </p>

          <!-- Acciones del Hero según estado de autenticación -->
          <div class="hero-actions">
            <button
              id="hero-cta-catalog"
              class="cta-btn cta-btn--primary"
              @click="goToCatalog"
              aria-label="Explorar el catálogo completo de productos"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" class="cta-icon" aria-hidden="true">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Explorar Catálogo
            </button>

            <button
              v-if="!isAuthenticated"
              id="hero-cta-register"
              class="cta-btn cta-btn--ghost"
              @click="goToRegister"
              aria-label="Crear una cuenta nueva"
            >
              Crear Cuenta Gratis
            </button>

            <span v-else class="hero-welcome-badge" role="status">
              ¡Hola de vuelta, <strong>{{ user?.name }}</strong>! 👋
            </span>
          </div>
        </div>

        <!-- Decoración visual del hero (lado derecho) -->
        <div class="hero-visual" aria-hidden="true">
          <div class="hero-glow-ring"></div>
          <div class="hero-icon-grid">
            <span class="grid-icon grid-icon--tl">📦</span>
            <span class="grid-icon grid-icon--tr">⚡</span>
            <span class="grid-icon grid-icon--bl">🛡️</span>
            <span class="grid-icon grid-icon--br">🌟</span>
            <span class="grid-icon grid-icon--center">🛍️</span>
          </div>
        </div>
      </section>

      <!-- ── SECCIÓN DE MÉTRICAS RÁPIDAS ──────────────────────── -->
      <section class="metrics-strip" aria-label="Características destacadas de NebriAmazon">
        <article class="metric-card">
          <span class="metric-icon" aria-hidden="true">🚀</span>
          <div class="metric-info">
            <strong class="metric-value">24h</strong>
            <span class="metric-label">Envío Express</span>
          </div>
        </article>
        <article class="metric-card">
          <span class="metric-icon" aria-hidden="true">🔒</span>
          <div class="metric-info">
            <strong class="metric-value">100%</strong>
            <span class="metric-label">Pago Seguro</span>
          </div>
        </article>
        <article class="metric-card">
          <span class="metric-icon" aria-hidden="true">🎁</span>
          <div class="metric-info">
            <strong class="metric-value">+500</strong>
            <span class="metric-label">Productos Únicos</span>
          </div>
        </article>
        <article class="metric-card">
          <span class="metric-icon" aria-hidden="true">⭐</span>
          <div class="metric-info">
            <strong class="metric-value">4.9/5</strong>
            <span class="metric-label">Satisfacción</span>
          </div>
        </article>
      </section>


      ``
      <!-- ── SECCIÓN DE CATEGORÍAS  ──────────────────── -->
      <section class="categories-section" aria-labelledby="categories-heading">
        <header class="section-header">
          <h2 id="categories-heading" class="section-title">
            Explorar por Categorías
          </h2>
        </header>
        <!-- CategoryGrid maneja de forma aislada su lógica de la Iteración anterior -->
        <CategoryGrid />
      </section>
      ``

      <!-- ── SECCIÓN DE CATÁLOGO EN PORTADA ───────────────────── -->
      <section class="featured-catalog-section" aria-labelledby="catalog-heading">
        <header class="section-header">
          <h2 id="catalog-heading" class="section-title">
            Artículos Destacados
          </h2>
          <button
            class="section-link-btn"
            @click="goToCatalog"
            aria-label="Ver todos los productos del catálogo"
          >
            Ver todo el catálogo →
          </button>
        </header>

        <!-- ProductGrid: maneja su propio estado de loading y filtros  -->
        <!-- a través de useProductStore. HomeView no interviene en nada. -->
        <ProductGrid />
      </section>

      <!-- ── SECCIÓN DE INVITACIÓN AL REGISTRO (solo anónimos) ── -->
      <section
        v-if="!isAuthenticated"
        class="register-cta-section"
        aria-labelledby="register-heading"
      >
        <div class="register-cta-card">
          <span class="register-cta-icon" aria-hidden="true">🎯</span>
          <h2 id="register-heading" class="register-cta-title">
            Únete a NebriAmazon
          </h2>
          <p class="register-cta-body">
            Regístrate gratis y disfruta de seguimiento de pedidos,
            listas de deseos y ofertas exclusivas.
          </p>
          <div class="register-cta-actions">
            <button
              id="register-section-btn"
              class="cta-btn cta-btn--primary"
              @click="goToRegister"
              aria-label="Registrarse en NebriAmazon"
            >
              Crear Mi Cuenta
            </button>
            <button
              id="login-section-btn"
              class="cta-btn cta-btn--ghost"
              @click="goToLogin"
              aria-label="Iniciar sesión en NebriAmazon"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </section>

    </main>

    <!-- ══ PIE DE PÁGINA GLOBAL ══════════════════════════════════ -->
    <footer class="home-footer" role="contentinfo">
      <div class="footer-inner">
        <span class="footer-brand">
          Nebri<span class="brand-accent">Amazon</span>
        </span>
        <p class="footer-copy">
          © {{ new Date().getFullYear() }} NebriAmazon — Proyecto académico.
          Todos los derechos reservados.
        </p>
        <nav class="footer-nav" aria-label="Navegación del pie de página">
          <button class="footer-link" @click="goToCatalog">Catálogo</button>
          <span class="footer-sep" aria-hidden="true">·</span>
          <button class="footer-link" @click="goToLogin">Mi Cuenta</button>
        </nav>
      </div>
    </footer>

    <!-- ══ CHATBOT FLOTANTE (position: fixed, no afecta el flujo) ══ -->
    <!-- El widget gestiona su propio estado de apertura de forma local. -->
    <!-- No produce re-renderizados en HomeView al abrirse o cerrarse. -->
    <ChatbotWidget />

  </div>
</template>

<style scoped>
/* ─── Layout Global del Shell ─────────────────────────────── */
.home-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-background);
  font-family: var(--font-sans);
}

/* ─── Contenedor Principal ──────────────────────────────────── */
.home-container {
  flex: 1;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

/* ─── SECCIÓN HERO ─────────────────────────────────────────── */
.hero-section {
  display: grid;
  grid-template-columns: 1fr 380px;
  align-items: center;
  gap: 3rem;
  background-color: var(--color-primary);
  border-radius: 20px;
  padding: 4rem 3.5rem;
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

/* Gradiente decorativo de fondo del hero */
.hero-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at 80% 50%,
    hsla(36, 100%, 50%, 0.12) 0%,
    transparent 60%
  );
  pointer-events: none;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: var(--color-accent);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 0.4rem 0.85rem;
  border-radius: 20px;
  width: fit-content;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--color-accent);
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}

.hero-title {
  font-size: 3.2rem;
  font-weight: 800;
  color: var(--color-surface);
  line-height: 1.15;
  letter-spacing: -1px;
  margin: 0;
}

.hero-brand {
  display: block;
}

.brand-accent {
  color: var(--color-accent);
}

.hero-subtitle {
  font-size: 1.05rem;
  color: rgba(255, 255, 255, 0.72);
  line-height: 1.65;
  max-width: 480px;
  margin: 0;
}

/* ─── Acciones del Hero ─────────────────────────────────────── */
.hero-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.hero-welcome-badge {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.85);
  background-color: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.hero-welcome-badge strong {
  color: var(--color-accent);
}

/* ─── Botones CTA ────────────────────────────────────────────── */
.cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1.75rem;
  border-radius: 10px;
  font-family: var(--font-sans);
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  text-decoration: none;
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast),
    background-color var(--transition-fast),
    border-color var(--transition-fast);
  outline: none;
  white-space: nowrap;
}

.cta-btn--primary {
  background-color: var(--color-accent);
  color: var(--color-primary);
  box-shadow: 0 4px 14px hsla(36, 100%, 50%, 0.4);
}

.cta-btn--primary:hover {
  background-color: var(--color-accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px hsla(36, 100%, 50%, 0.55);
}

.cta-btn--primary:active {
  transform: scale(0.98);
}

.cta-btn--primary:focus-visible {
  outline: 3px solid rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}

.cta-btn--ghost {
  background-color: rgba(255, 255, 255, 0.1); /* Fondo sutil para que tenga cuerpo */
  color: var(--color-surface); /* Texto en blanco sólido y legible */
  border: 1.5px solid rgba(255, 255, 255, 0.4); /* Borde visible */
}

.cta-btn--ghost:hover {
  background-color: rgba(255, 255, 255, 0.2); /* Se aclara al pasar el ratón */
  border-color: var(--color-accent); /* ¡Un toque dorado del color corporativo al hacer hover! */
  transform: translateY(-2px); /* Pequeño salto hacia arriba igual que el botón primario */
}

.cta-btn--ghost:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.cta-icon {
  width: 18px;
  height: 18px;
}

/* ─── Decoración Visual del Hero ───────────────────────────── */
.hero-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 280px;
}

.hero-glow-ring {
  position: absolute;
  width: 240px;
  height: 240px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    hsla(36, 100%, 50%, 0.18) 0%,
    transparent 70%
  );
  animation: glow-pulse 3s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
}

.hero-icon-grid {
  position: relative;
  width: 200px;
  height: 200px;
}

.grid-icon {
  position: absolute;
  font-size: 2.4rem;
  animation: float-icon 4s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.grid-icon--center {
  font-size: 3.5rem;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-duration: 5s;
}

.grid-icon--tl { top: 0; left: 0; animation-delay: 0s; }
.grid-icon--tr { top: 0; right: 0; animation-delay: 0.8s; }
.grid-icon--bl { bottom: 0; left: 0; animation-delay: 1.6s; }
.grid-icon--br { bottom: 0; right: 0; animation-delay: 2.4s; }

@keyframes float-icon {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.grid-icon--center {
  animation: float-icon 5s ease-in-out infinite;
  transform: translate(-50%, -50%);
}

/* ─── MÉTRICAS ──────────────────────────────────────────────── */
.metrics-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.metric-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.metric-icon {
  font-size: 2rem;
  line-height: 1;
  flex-shrink: 0;
}

.metric-info {
  display: flex;
  flex-direction: column;
}

.metric-value {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--color-primary);
  letter-spacing: -0.4px;
  line-height: 1.1;
}

.metric-label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  font-weight: 600;
  margin-top: 0.15rem;
}

/* ─── SECCIÓN CATÁLOGO ──────────────────────────────────────── */
.featured-catalog-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid var(--color-border);
  padding-bottom: 0.75rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-primary);
  margin: 0;
  letter-spacing: -0.3px;
}

.section-link-btn {
  background: none;
  border: none;
  font-family: var(--font-sans);
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-accent-hover);
  cursor: pointer;
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  transition: color var(--transition-fast), background-color var(--transition-fast);
  outline: none;
}

.section-link-btn:hover {
  color: var(--color-primary);
  background-color: var(--color-background);
}

.section-link-btn:focus-visible {
  outline: 2px solid var(--color-accent);
}

/* ─── SECCIÓN REGISTRO CTA ───────────────────────────────────── */
.register-cta-section {
  display: flex;
  justify-content: center;
}

.register-cta-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 1.25rem;
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    var(--color-primary-light) 100%
  );
  border-radius: 20px;
  padding: 3.5rem 3rem;
  max-width: 640px;
  width: 100%;
  box-shadow: var(--shadow-lg);
  position: relative;
  overflow: hidden;
}

.register-cta-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 70% 30%,
    hsla(36, 100%, 50%, 0.15) 0%,
    transparent 60%
  );
  pointer-events: none;
}

.register-cta-icon {
  font-size: 3.5rem;
  line-height: 1;
  position: relative;
  z-index: 1;
}

.register-cta-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--color-surface);
  margin: 0;
  letter-spacing: -0.4px;
  position: relative;
  z-index: 1;
}

.register-cta-body {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.6;
  max-width: 440px;
  margin: 0;
  position: relative;
  z-index: 1;
}

.register-cta-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  position: relative;
  z-index: 1;
}

/* ─── PIE DE PÁGINA ──────────────────────────────────────────── */
.home-footer {
  background-color: var(--color-primary);
  color: rgba(255, 255, 255, 0.65);
  padding: 2rem 1rem;
  margin-top: auto;
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

.footer-brand {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-surface);
  letter-spacing: -0.3px;
}

.footer-copy {
  font-size: 0.82rem;
  margin: 0;
  text-align: center;
}

.footer-nav {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.footer-link {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.65);
  font-family: var(--font-sans);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: color var(--transition-fast);
  outline: none;
}

.footer-link:hover {
  color: var(--color-accent);
}

.footer-link:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.footer-sep {
  opacity: 0.4;
}

/* ─── RESPONSIVIDAD ────────────────────────────────────────── */
@media (max-width: 1100px) {
  .hero-section {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 3rem 2rem;
  }

  .hero-visual {
    display: none;
  }

  .hero-subtitle {
    max-width: 100%;
  }

  .hero-actions {
    justify-content: center;
  }

  .metrics-strip {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .home-container {
    padding: 1.25rem 0.75rem 3rem;
    gap: 2.5rem;
  }

  .hero-title {
    font-size: 2.2rem;
  }

  .hero-section {
    padding: 2.5rem 1.5rem;
  }

  .metrics-strip {
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }

  .metric-card {
    padding: 1.1rem;
  }

  .register-cta-card {
    padding: 2.5rem 1.5rem;
  }

  .register-cta-title {
    font-size: 1.4rem;
  }

  .footer-inner {
    flex-direction: column;
    text-align: center;
  }
}
</style>
