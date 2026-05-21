<template>
  <div class="checkout-view container">
    <h2 class="view-title">Confirmar Pedido y Pago</h2>

    <!-- Estado de Pedido Exitoso -->
    <div v-if="orderSuccess" class="success-screen float-in">
      <span class="success-icon">🎉</span>
      <h3>¡Compra completada con éxito!</h3>
      <p>Tu pedido ha sido registrado en NebriAmazon y está siendo procesado en nuestros almacenes.</p>
      <div v-if="orderId" class="order-id-box">
        Ref. del pedido: <strong>{{ orderId }}</strong>
      </div>
      <p class="shipping-info">Se te enviará un correo con el código de seguimiento de mensajería express 24h.</p>
      <BaseButton variant="primary" @click="returnToCatalog">Seguir Comprando</BaseButton>
    </div>

    <!-- Layout del Checkout -->
    <div v-else class="checkout-layout">
      <!-- Formulario de Envío y Pago -->
      <form @submit.prevent="handlePayment" class="form-column">
        <section class="checkout-section">
          <h3>👤 Datos de Entrega</h3>
          <div class="form-grid">
            <BaseInput label="Nombre de Receptor" placeholder="Juan Pérez" v-model="form.name" :error="errors.name" />
            <BaseInput label="Dirección de Envío" placeholder="Calle Nebrija, 14, 2ºA" v-model="form.address" :error="errors.address" />
            <div class="form-row">
              <BaseInput label="Ciudad" placeholder="Madrid" v-model="form.city" :error="errors.city" />
              <BaseInput label="Código Postal" placeholder="28001" v-model="form.zip" :error="errors.zip" />
            </div>
          </div>
        </section>

        <section class="checkout-section">
          <h3>💳 Datos de Pago (Simulación Segura)</h3>
          <div class="form-grid">
            <BaseInput label="Número de Tarjeta" placeholder="4532 9876 1234 5678" v-model="form.card" :error="errors.card" />
            <div class="form-row">
              <BaseInput label="Fecha de Caducidad" placeholder="MM/AA" v-model="form.cardExp" :error="errors.cardExp" />
              <BaseInput label="CVV (Código de Seguridad)" placeholder="123" type="password" v-model="form.cardCvv" :error="errors.cardCvv" />
            </div>
          </div>
        </section>

        <div class="actions-row">
          <BaseButton type="submit" variant="primary" :loading="loading" class="pay-btn">
            Confirmar y Pagar {{ formatPrice(cartStore.total) }}
          </BaseButton>
        </div>
      </form>

      <!-- Resumen en Panel Lateral -->
      <aside class="summary-column float-in">
        <h3 class="summary-title">Resumen de tu pedido</h3>
        
        <div class="items-preview-list">
          <div v-for="item in cartStore.items" :key="item.id" class="preview-item">
            <span class="item-name">{{ item.product.name }}</span>
            <span class="item-qty-price">{{ item.quantity }} ud x {{ formatPrice(item.product.price) }}</span>
          </div>
        </div>

        <div class="divider"></div>

        <div class="totals-section">
          <div class="total-row-item">
            <span>Subtotal:</span>
            <span>{{ formatPrice(cartStore.subtotal) }}</span>
          </div>
          <div class="total-row-item">
            <span>Impuestos (IVA 21%):</span>
            <span>{{ formatPrice(cartStore.taxAmount) }}</span>
          </div>
          <div class="divider"></div>
          <div class="total-row-item total-final">
            <span>Total Final:</span>
            <span class="value-highlight">{{ formatPrice(cartStore.total) }}</span>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import orderService from '@/services/orderService';
import BaseInput from '@/components/atoms/BaseInput.vue';
import BaseButton from '@/components/atoms/BaseButton.vue';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

const loading = ref(false);
const orderSuccess = ref(false);
const orderId = ref('');

const form = reactive({
  name: '',
  address: '',
  city: '',
  zip: '',
  card: '',
  cardExp: '',
  cardCvv: ''
});

const errors = reactive({
  name: '',
  address: '',
  city: '',
  zip: '',
  card: '',
  cardExp: '',
  cardCvv: ''
});

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);
};

const validateForm = () => {
  let isValid = true;
  
  // Limpiar errores previos
  Object.keys(errors).forEach(key => errors[key] = '');

  if (!form.name.trim()) { errors.name = 'El nombre del receptor es obligatorio'; isValid = false; }
  if (!form.address.trim()) { errors.address = 'La dirección física es obligatoria'; isValid = false; }
  if (!form.city.trim()) { errors.city = 'La ciudad es obligatoria'; isValid = false; }
  
  const zipRegex = /^\d{5}$/;
  if (!zipRegex.test(form.zip)) { errors.zip = 'Código postal no válido (debe tener 5 dígitos)'; isValid = false; }

  const cardRegex = /^\d{16}$|^\d{4}\s\d{4}\s\d{4}\s\d{4}$/;
  if (!cardRegex.test(form.card.replace(/\s+/g, ''))) { errors.card = 'Número de tarjeta no válido (debe tener 16 dígitos)'; isValid = false; }

  const expRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!expRegex.test(form.cardExp)) { errors.cardExp = 'Fecha de expiración no válida (MM/AA)'; isValid = false; }

  const cvvRegex = /^\d{3}$/;
  if (!cvvRegex.test(form.cardCvv)) { errors.cardCvv = 'Código de seguridad no válido (debe tener 3 dígitos)'; isValid = false; }

  return isValid;
};

const handlePayment = async () => {
  if (!validateForm()) return;

  loading.value = true;
  try {
    if (authStore.isAuthenticated) {
      // Simula petición al backend real en una transacción con bloqueo pesimista
      const data = await orderService.checkout();
      orderId.value = data.id;
    } else {
      // Fallback si corre totalmente local sin backend levantado
      orderId.value = 'nebri_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
    
    // Simula retardo de red de la pasarela bancaria
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    orderSuccess.value = true;
    cartStore.clearCart();
  } catch (error) {
    alert(error.message || 'Error al procesar el pago.');
  } finally {
    loading.value = false;
  }
};

const returnToCatalog = () => {
  router.push({ name: 'Catalog' });
};

onMounted(() => {
  // Redirige al catálogo si no hay artículos en la cesta al ingresar aquí
  if (cartStore.items.length === 0 && !orderSuccess.value) {
    router.push({ name: 'Catalog' });
  }
});
</script>

<style scoped>
.checkout-view {
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

.success-screen {
  text-align: center;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-sm);
  max-width: 650px;
  margin: 0 auto;
}

.success-icon {
  font-size: 4.5rem;
}

.success-screen h3 {
  font-family: var(--font-title);
  font-size: 1.6rem;
  color: var(--color-success);
}

.success-screen p {
  color: var(--color-text);
  font-size: 1rem;
  max-width: 480px;
}

.order-id-box {
  background-color: var(--color-background);
  padding: 10px 24px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  font-size: 0.95rem;
}

.shipping-info {
  font-size: 0.85rem !important;
  color: var(--color-text-muted) !important;
  margin-bottom: 12px;
}

.checkout-layout {
  display: grid;
  grid-template-columns: minmax(300px, 1.8fr) minmax(280px, 1.2fr);
  gap: 40px;
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.checkout-section {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.checkout-section h3 {
  font-family: var(--font-title);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 20px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 8px;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.pay-btn {
  width: 100%;
  padding: 12px !important;
  font-size: 1.05rem !important;
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
  height: fit-content;
  position: sticky;
  top: 90px;
}

.summary-title {
  font-family: var(--font-title);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 12px;
}

.items-preview-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 250px;
  overflow-y: auto;
  padding-right: 4px;
}

.preview-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-item .item-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.preview-item .item-qty-price {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.divider {
  height: 1px;
  background-color: var(--color-border);
  width: 100%;
}

.totals-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 0.9rem;
}

.total-row-item {
  display: flex;
  justify-content: space-between;
}

.total-final {
  font-family: var(--font-title);
  font-size: 1.1rem;
  font-weight: 700;
  align-items: baseline;
}

.value-highlight {
  font-size: 1.45rem;
  font-weight: 800;
  color: var(--color-accent);
}

@media (max-width: 768px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
