<script setup>
/**
 * src/views/RegisterView.vue
 * ─────────────────────────────────────────────────────────────
 * Vista de Registro de Usuario de NebriAmazon.
 *
 * Implementa el formulario de registro con la misma consistencia visual y:
 *   1. Campos para Nombre completo, Email, Contraseña y Confirmar Contraseña.
 *   2. Validación en cliente reactiva (longitud de contraseña, coincidencia y formato email).
 *   3. Integración con Pinia authStore para registro automático y login fluido.
 *   4. Cabecera global (AppNavbar) y pie de página coherentes.
 */

import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';

import AppNavbar from '@/components/organisms/AppNavbar.vue';
import BaseInput from '@/components/atoms/BaseInput.vue';

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();

const { totalItemsCount } = storeToRefs(cartStore);
const { loading } = storeToRefs(authStore);

// ─── Estado local del formulario ──────────────────────────────
const fullName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const submitted = ref(false);
const serverError = ref('');

// ─── Validaciones reactivas (Clean Code) ───────────────────────
const errors = computed(() => {
  const nameVal = fullName.value.trim();
  const emailVal = email.value.trim();
  const passwordVal = password.value;
  const confirmVal = confirmPassword.value;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return {
    fullName: !nameVal 
      ? 'El nombre completo es obligatorio.' 
      : '',
    email: !emailVal 
      ? 'El correo electrónico es obligatorio.' 
      : !emailRegex.test(emailVal) 
        ? 'El formato de correo electrónico no es válido.' 
        : '',
    password: !passwordVal 
      ? 'La contraseña es obligatoria.' 
      : passwordVal.length < 6 
        ? 'La contraseña debe tener al menos 6 caracteres.' 
        : '',
    confirmPassword: !confirmVal 
      ? 'Debes confirmar la contraseña.' 
      : confirmVal !== passwordVal 
        ? 'Las contraseñas no coinciden.' 
        : ''
  };
});

const isFormValid = computed(() => 
  Object.values(errors.value).every(err => err === '')
);

// ─── Acciones de navegación ──────────────────────────────────
const goToLogin = () => router.push({ name: 'Login' });
const goToHome = () => router.push({ name: 'Home' });
const goToCatalog = () => router.push({ name: 'Catalog' });

const handleNavigation = (destination) => {
  if (destination === 'home') {
    goToHome();
  } else if (destination === 'Catalog') {
    goToCatalog();
  } else if (destination === 'orders') {
    router.push('/catalog'); // Fallback seguro
  } else if (destination === 'cart') {
    router.push('/catalog'); // Fallback seguro
  }
};

// ─── Envío del formulario ──────────────────────────────────────
const handleRegisterSubmit = async () => {
  submitted.value = true;
  serverError.value = '';

  if (!isFormValid.value) return;

  try {
    await authStore.register({
      name: fullName.value,
      email: email.value,
      password: password.value
    });
    
    // Registro exitoso — Redirección automática a Home
    goToHome();
  } catch (error) {
    serverError.value = error?.message || 'Error al registrar la cuenta. Inténtalo de nuevo.';
  }
};
</script>

<template>
  <div class="auth-layout">
    <!-- ══ CABECERA GLOBAL ══════════════════════════════════════ -->
    <AppNavbar 
      :cart-count="totalItemsCount"
      @navigate="handleNavigation"
    />

    <!-- ══ CONTENIDO PRINCIPAL CENTRADO ══════════════════════════ -->
    <main class="auth-container" id="main-content" tabindex="-1">
      <section class="auth-card-wrapper" aria-labelledby="register-title">
        <div class="auth-card">
          <!-- Logo secundario / Identidad -->
          <div class="auth-logo" @click="goToHome" role="button" tabindex="0" aria-label="Volver a Inicio">
            <span class="logo-text">Nebri<span class="logo-highlight">Amazon</span></span>
          </div>

          <h1 id="register-title" class="auth-title">Crear cuenta</h1>
          <p class="auth-subtitle">Regístrate para realizar pedidos y disfrutar de envíos express.</p>

          <!-- Banner de error de servidor -->
          <div v-if="serverError" class="server-error-banner" role="alert" aria-live="assertive">
            <span class="error-icon" aria-hidden="true">⚠️</span>
            {{ serverError }}
          </div>

          <form class="auth-form" novalidate @submit.prevent="handleRegisterSubmit">
            <!-- Nombre Completo -->
            <BaseInput
              id="register-name"
              v-model="fullName"
              label="Nombre completo"
              type="text"
              placeholder="Juan Pérez"
              required
              autocomplete="name"
              :error="submitted ? errors.fullName : ''"
              :disabled="loading"
            />

            <!-- Email -->
            <BaseInput
              id="register-email"
              v-model="email"
              label="Correo electrónico"
              type="email"
              placeholder="nombre@ejemplo.com"
              required
              autocomplete="email"
              :error="submitted ? errors.email : ''"
              :disabled="loading"
            />

            <!-- Contraseña -->
            <BaseInput
              id="register-password"
              v-model="password"
              label="Contraseña"
              type="password"
              placeholder="Mínimo 6 caracteres"
              required
              autocomplete="new-password"
              :error="submitted ? errors.password : ''"
              :disabled="loading"
            />

            <!-- Confirmar Contraseña -->
            <BaseInput
              id="register-confirm-password"
              v-model="confirmPassword"
              label="Confirmar contraseña"
              type="password"
              placeholder="Repite la contraseña"
              required
              autocomplete="new-password"
              :error="submitted ? errors.confirmPassword : ''"
              :disabled="loading"
            />

            <!-- Botón de Envío -->
            <button
              id="register-submit-btn"
              type="submit"
              class="auth-submit-btn"
              :disabled="loading"
              :aria-busy="loading"
              aria-label="Registrarse en NebriAmazon"
            >
              <span v-if="!loading" class="btn-content">
                Registrarse
              </span>
              <span v-else class="btn-loading" aria-label="Creando cuenta…">
                <span class="spinner" aria-hidden="true"></span>
                Creando cuenta…
              </span>
            </button>
          </form>

          <!-- Separador decorativo -->
          <div class="auth-divider">
            <span class="divider-text">¿Ya tienes cuenta?</span>
          </div>

          <!-- Enlace alternativo -->
          <button
            class="auth-alt-btn"
            @click="goToLogin"
            :disabled="loading"
            aria-label="Ir al inicio de sesión"
          >
            Inicia sesión aquí
          </button>
        </div>
      </section>
    </main>

    <!-- ══ PIE DE PÁGINA GLOBAL ══════════════════════════════════ -->
    <footer class="auth-footer" role="contentinfo">
      <div class="footer-inner">
        <span class="footer-brand" @click="goToHome" role="button" tabindex="0">
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
  </div>
</template>

<style scoped>
/* ── Layout General ────────────────────────────────────────── */
.auth-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-background);
  font-family: var(--font-sans);
}

.auth-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
}

/* ── Tarjeta de Autenticación ────────────────────────────────── */
.auth-card-wrapper {
  width: 100%;
  max-width: 440px;
  animation: cardFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.auth-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: var(--shadow-lg);
  text-align: center;
}

@keyframes cardFadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Logo de la Marca en Card ───────────────────────────────── */
.auth-logo {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  margin-bottom: 1.5rem;
  outline: none;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: transform var(--transition-fast);
}

.auth-logo:hover {
  transform: scale(1.02);
}

.logo-text {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-primary);
  letter-spacing: -0.5px;
}

.logo-highlight {
  color: var(--color-accent);
}

/* ── Títulos y Textos ──────────────────────────────────────── */
.auth-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  letter-spacing: -0.5px;
}

.auth-subtitle {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  line-height: 1.45;
  margin-bottom: 2rem;
}

/* ── Formulario y Botón Submit ──────────────────────────────── */
.auth-form {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
}

.auth-submit-btn {
  width: 100%;
  padding: 0.8rem 1.5rem;
  background: linear-gradient(
    135deg,
    var(--color-accent) 0%,
    var(--color-accent-hover) 100%
  );
  color: var(--color-primary);
  border: none;
  border-radius: 8px;
  font-family: var(--font-sans);
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast),
    opacity var(--transition-fast);
  box-shadow: 0 4px 12px hsla(36, 100%, 50%, 0.3);
  margin-top: 0.5rem;
}

.auth-submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px hsla(36, 100%, 50%, 0.45);
}

.auth-submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.auth-submit-btn:disabled {
  opacity: 0.75;
  cursor: not-allowed;
  transform: none;
}

/* ── Separador y Enlace Alternativo ─────────────────────────── */
.auth-divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
}

.auth-divider::before,
.auth-divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid var(--color-border);
}

.auth-divider::before {
  margin-right: .75em;
}

.auth-divider::after {
  margin-left: .75em;
}

.divider-text {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.auth-alt-btn {
  width: 100%;
  padding: 0.75rem 1.5rem;
  background-color: var(--color-background);
  color: var(--color-text);
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  font-family: var(--font-sans);
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast);
}

.auth-alt-btn:hover:not(:disabled) {
  background-color: var(--color-border);
  border-color: var(--color-text-muted);
}

.auth-alt-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Banner de Error del Servidor ────────────────────────────── */
.server-error-banner {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.85rem 1.1rem;
  background-color: hsl(0, 84%, 96%);
  border: 1px solid hsl(0, 84%, 80%);
  border-left: 4px solid var(--color-error);
  border-radius: 8px;
  color: hsl(0, 70%, 35%);
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  text-align: left;
  animation: errorSlideIn 0.25s ease-out;
}

.error-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

/* ── Spinner de carga ── */
.spinner {
  width: 16px;
  height: 16px;
  border: 2.5px solid var(--color-primary);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
  flex-shrink: 0;
  vertical-align: middle;
}

.btn-content,
.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes errorSlideIn {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Pie de Página ─────────────────────────────────────────── */
.auth-footer {
  background-color: var(--color-primary);
  color: rgba(255, 255, 255, 0.65);
  padding: 1.5rem 1rem;
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
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-surface);
  letter-spacing: -0.3px;
  cursor: pointer;
}

.brand-accent {
  color: var(--color-accent);
}

.footer-copy {
  font-size: 0.78rem;
  margin: 0;
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
  font-size: 0.8rem;
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

.footer-sep {
  opacity: 0.4;
  font-size: 0.8rem;
}

@media (max-width: 600px) {
  .auth-card {
    padding: 1.5rem;
  }
  .footer-inner {
    flex-direction: column;
    text-align: center;
  }
}
</style>
