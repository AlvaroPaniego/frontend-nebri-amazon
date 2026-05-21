<template>
  <div class="auth-view container">
    <div class="auth-card float-in">
      <h2 class="auth-title">Crear Cuenta</h2>
      <p class="auth-subtitle">Regístrate en NebriAmazon para disfrutar de envíos express en 24h y guardar tu cesta.</p>

      <form @submit.prevent="handleRegister" class="auth-form">
        <BaseInput
          label="Tu Nombre"
          placeholder="Juan Pérez"
          type="text"
          v-model="name"
          :error="errors.name"
        />

        <BaseInput
          label="Correo Electrónico"
          placeholder="nombre@ejemplo.com"
          type="email"
          v-model="email"
          :error="errors.email"
        />

        <BaseInput
          label="Contraseña"
          placeholder="Mínimo 6 caracteres"
          type="password"
          v-model="password"
          :error="errors.password"
        />

        <BaseButton
          type="submit"
          variant="primary"
          :loading="authStore.loading"
          class="auth-btn"
        >
          Crear tu Cuenta
        </BaseButton>
      </form>

      <div class="divider"></div>

      <div class="auth-footer">
        <span>¿Ya tienes una cuenta?</span>
        <router-link :to="{ name: 'Login', query: route.query }">
          <BaseButton variant="secondary" class="signin-btn">Identifícate</BaseButton>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import BaseInput from '@/components/atoms/BaseInput.vue';
import BaseButton from '@/components/atoms/BaseButton.vue';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const cartStore = useCartStore();

const name = ref('');
const email = ref('');
const password = ref('');

const errors = reactive({
  name: '',
  email: '',
  password: ''
});

const validateForm = () => {
  let isValid = true;
  errors.name = '';
  errors.email = '';
  errors.password = '';

  if (!name.value.trim()) {
    errors.name = 'El nombre es obligatorio';
    isValid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    errors.email = 'Introduce una dirección de correo válida';
    isValid = false;
  }

  if (password.value.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres';
    isValid = false;
  }

  return isValid;
};

const handleRegister = async () => {
  if (!validateForm()) return;

  try {
    await authStore.register(name.value, email.value, password.value);
    await cartStore.initializeCart();
    
    const redirectTo = route.query.redirect || '/';
    router.push(redirectTo);
  } catch (error) {
    // Simulación local si el servidor no está en línea
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      const mockUser = {
        id: 'mock_usr_' + Date.now(),
        name: name.value,
        email: email.value,
        role: 'customer'
      };
      
      authStore.token = 'mock_jwt_token_register_hash';
      authStore.user = mockUser;
      localStorage.setItem('nebri_token', authStore.token);
      localStorage.setItem('nebri_user', JSON.stringify(mockUser));

      await cartStore.initializeCart();

      const redirectTo = route.query.redirect || '/';
      router.push(redirectTo);
    } else {
      alert(error.message || 'Error al crear la cuenta.');
    }
  }
};
</script>

<style scoped>
.auth-view {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  min-height: calc(100vh - 70px - 60px);
}

.auth-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 40px;
  width: 100%;
  max-width: 450px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.auth-title {
  font-family: var(--font-title);
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-primary);
  text-align: center;
}

.auth-subtitle {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  line-height: 1.4;
  text-align: center;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.auth-btn {
  width: 100%;
  margin-top: 8px;
}

.divider {
  height: 1px;
  background-color: var(--color-border);
  width: 100%;
}

.auth-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.signin-btn {
  width: 100%;
  min-height: 38px !important;
  font-size: 0.85rem !important;
}
</style>
