<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { useCartStore } from "@/store/cart";
import { storeToRefs } from "pinia";
import AppNavbar from "@/components/organisms/AppNavbar.vue";

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();

const { totalItemsCount } = storeToRefs(cartStore);

const form = ref({
  email: "",
  password: "",
});

const formError = ref("");
const isSubmitting = ref(false);

const goToCatalog = () => router.push({ name: "Catalog" });
const goToHome = () => router.push({ name: "Home" });

// Orquestación de navegación (manteniendo arquitectura de eventos de HomeView)
const handleNavigation = (destination) => {
  const destLower = destination?.toLowerCase();
  if (destLower === "home") {
    goToHome();
  } else if (
    destLower === "catalog" ||
    destLower === "cart" ||
    destLower === "orders"
  ) {
    goToCatalog();
  } else if (destLower === "login") {
    // Ya estamos aquí
  }
};

const validateForm = () => {
  if (!form.value.email.trim() || !form.value.password.trim()) {
    formError.value = "El correo electrónico y la contraseña son obligatorios.";
    return false;
  }
  if (form.value.password.length < 6) {
    formError.value = "La contraseña debe tener al menos 6 caracteres.";
    return false;
  }
  formError.value = "";
  return true;
};

const handleLogin = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;
  formError.value = "";

  try {
    await authStore.login({
      email: form.value.email,
      password: form.value.password,
    });
    // Tras autenticación exitosa, usamos la orquestación para navegar
    handleNavigation("Catalog");
  } catch (error) {
    formError.value =
      error.message || "Error al iniciar sesión. Verifica tus credenciales.";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="login-layout">
    <!-- Navbar global orquestada con eventos @navigate -->
    <AppNavbar :cart-count="totalItemsCount" @navigate="handleNavigation" />

    <main class="login-container">
      <section class="login-card" aria-labelledby="login-heading">
        <div class="login-header">
          <span class="login-icon" aria-hidden="true">🔐</span>
          <h1 id="login-heading" class="login-title">Iniciar Sesión</h1>
          <p class="login-subtitle">Bienvenido de nuevo a NebriAmazon</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form" novalidate>
          <div v-if="formError" class="error-message" role="alert">
            {{ formError }}
          </div>

          <div class="form-group">
            <label for="email" class="form-label">Correo Electrónico</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="form-input"
              placeholder="tu@email.com"
              required
              :disabled="isSubmitting"
            />
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Contraseña</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="form-input"
              placeholder="••••••••"
              required
              :disabled="isSubmitting"
            />
          </div>

          <button
            type="submit"
            class="submit-btn"
            :class="{ 'submit-btn--loading': isSubmitting }"
            :disabled="isSubmitting"
          >
            <span v-if="!isSubmitting">Entrar</span>
            <span v-else class="loader"></span>
          </button>
        </form>

        <div class="login-footer">
          <p>
            ¿No tienes una cuenta?
            <a
              href="#"
              @click.prevent="handleNavigation('home')"
              class="register-link"
              >Regístrate</a
            >
          </p>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.login-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-background);
  font-family: var(--font-sans);
}

.login-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.login-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 3rem 2.5rem;
  width: 100%;
  max-width: 480px;
  box-shadow: var(--shadow-lg);
}

.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.login-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.login-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-primary);
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
}

.login-subtitle {
  color: var(--color-text-muted);
  margin: 0;
  font-size: 1.05rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--color-primary);
}

.form-input {
  padding: 0.85rem 1rem;
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
  outline: none;
  background-color: var(--color-background);
}

.form-input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px hsla(36, 100%, 50%, 0.15);
}

.form-input:disabled {
  background-color: var(--color-border);
  cursor: not-allowed;
  opacity: 0.7;
}

.error-message {
  background-color: rgba(255, 68, 68, 0.1);
  color: #d32f2f;
  padding: 0.85rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  border: 1px solid rgba(255, 68, 68, 0.2);
  text-align: center;
}

.submit-btn {
  background-color: var(--color-accent);
  color: var(--color-primary);
  border: none;
  border-radius: 8px;
  padding: 1rem;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform var(--transition-fast),
    background-color var(--transition-fast),
    box-shadow var(--transition-fast);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  background-color: var(--color-accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px hsla(36, 100%, 50%, 0.3);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  background-color: var(--color-border);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.loader {
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.login-footer {
  margin-top: 2rem;
  text-align: center;
  font-size: 0.95rem;
  color: var(--color-text-muted);
}

.register-link {
  color: var(--color-accent-hover);
  font-weight: 700;
  text-decoration: none;
  transition: color var(--transition-fast);
}

.register-link:hover {
  color: var(--color-primary);
  text-decoration: underline;
}

@media (max-width: 600px) {
  .login-card {
    padding: 2rem 1.5rem;
    border-radius: 12px;
  }
}
</style>
