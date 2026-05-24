<script setup>
/**
 * src/views/CheckoutView.vue
 * ─────────────────────────────────────────────────────────────
 * Iteración 5 (Fase 5) — Tarea 2 & 4: Vista Contenedora del Checkout
 *
 * Orquesta el flujo transaccional completo:
 *   1. Muestra el resumen financiero (consumiendo useCartStore getters).
 *   2. Renderiza CheckoutForm.vue para recopilar los datos del usuario.
 *   3. Llama a orderService.placeOrder() con los datos del formulario.
 *   4. En caso de éxito: vacía el carrito (clearCart) y muestra confirmación.
 *   5. En caso de error: muestra la alerta tipada sin perder los datos del form.
 *
 * Esta vista NO contiene lógica de validación de campos (delegada al form)
 * ni lógica de red de bajo nivel (delegada al servicio). Solo orquesta.
 * (Principio de Responsabilidad Única — Clean Code)
 */

import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/store/cart';
import { placeOrder } from '@/services/orderService';
import CheckoutForm from '@/components/organisms/CheckoutForm.vue';

const router  = useRouter();
const cartStore = useCartStore();

// ─── Estado local de la transacción ───────────────────────────
const isLoading    = ref(false);
const serverError  = ref('');
/** Datos de la orden confirmada (null mientras no hay transacción exitosa) */
const confirmedOrder = ref(null);

// ─── Getters del carrito (precisión financiera de la Iteración 4) ─
const cartItems  = computed(() => cartStore.items);
const subtotal   = computed(() => cartStore.subtotal);
const taxAmount  = computed(() => cartStore.taxAmount);
const total      = computed(() => cartStore.total);
const itemsCount = computed(() => cartStore.totalItemsCount);

/** Devuelve la primera URL de imagen disponible del producto o un placeholder */
const resolveProductImage = (product) =>
  product?.image_urls?.[0] ?? `https://placehold.co/56x56/131921/FF9900?text=${encodeURIComponent(product?.name?.[0] ?? '?')}`;

// ─── Acción principal: procesar la orden ───────────────────────
/**
 * handleFormSubmit — Tarea 4, Iteración 5
 *
 * Recibe los datos validados del CheckoutForm, llama al servicio de
 * pedidos, y en función del resultado:
 *  - Éxito  → clearCart() + muestra pantalla de confirmación.
 *  - Error  → muestra el mensaje amigable sin resetear el formulario.
 *
 * @param {{ shipping: Object, payment: Object }} formData
 */
const handleFormSubmit = async ({ shipping, payment }) => {
  isLoading.value   = true;
  serverError.value = '';

  try {
    const order = await placeOrder(
      shipping,
      payment,
      cartItems.value,
      total.value,
    );

    // Tarea 4: vaciado automático del carrito tras transacción exitosa
    await cartStore.clearCart();

    confirmedOrder.value = order;
  } catch (error) {
    // El servicio lanza objetos tipados { status, code, message }
    serverError.value =
      error?.message ?? 'Error desconocido. Por favor, inténtalo de nuevo.';
  } finally {
    isLoading.value = false;
  }
};

/** Navegar al catálogo tras la confirmación */
const goToCatalog = () => router.push({ name: 'Catalog' });
/** Volver al carrito para revisar los ítems */
const goToCart    = () => router.push({ name: 'Cart' });
</script>

<template>
  <main class="checkout-view" aria-label="Página de pago y confirmación">

    <!-- ── Cabecera de la vista ── -->
    <header class="checkout-header">
      <h1 class="checkout-title">
        <span aria-hidden="true">🛒</span>
        Finalizar Compra
      </h1>
      <p class="checkout-subtitle">
        Tu pedido está a un solo paso. Revisa el resumen y completa el pago.
      </p>
    </header>

    <!-- ══ PANTALLA DE CONFIRMACIÓN (post-transacción exitosa) ══ -->
    <section
      v-if="confirmedOrder"
      class="confirmation-panel"
      aria-live="polite"
      aria-label="Pedido confirmado"
    >
      <div class="confirmation-icon" aria-hidden="true">✅</div>
      <h2 class="confirmation-title">¡Pedido Confirmado!</h2>
      <p class="confirmation-body">
        Tu compra se ha procesado correctamente.
        Recibirás actualizaciones sobre el estado de tu envío.
      </p>

      <dl class="confirmation-details">
        <div class="detail-row">
          <dt>Número de pedido</dt>
          <dd class="detail-highlight">{{ confirmedOrder.orderId.split('-')[0].toUpperCase() }}</dd>
        </div>
        <div class="detail-row">
          <dt>Código de seguimiento</dt>
          <dd class="detail-highlight tracking-code">{{ confirmedOrder.trackingCode }}</dd>
        </div>
        <div class="detail-row">
          <dt>Total cobrado</dt>
          <dd class="detail-highlight">{{ confirmedOrder.total.toFixed(2) }} €</dd>
        </div>
      </dl>

      <button
        id="go-to-catalog-btn"
        class="cta-btn cta-btn--primary"
        @click="goToCatalog"
      >
        Seguir Comprando
      </button>
    </section>

    <!-- ══ FLUJO PRINCIPAL DE CHECKOUT ══ -->
    <div v-else class="checkout-layout">

      <!-- ── Columna izquierda: Formulario ── -->
      <section class="checkout-form-column" aria-label="Formulario de pago">
        <CheckoutForm
          :is-loading="isLoading"
          :server-error="serverError"
          @submit="handleFormSubmit"
        />
      </section>

      <!-- ── Columna derecha: Resumen del pedido ── -->
      <aside class="checkout-summary" aria-label="Resumen del pedido">

        <div class="summary-card">
          <h2 class="summary-title">Resumen del Pedido</h2>

          <!-- Carrito vacío -->
          <div v-if="cartItems.length === 0" class="empty-cart-notice">
            <span aria-hidden="true">🛍️</span>
            Tu carrito está vacío.
            <button class="link-btn" @click="goToCatalog">Ir al catálogo</button>
          </div>

          <!-- Lista de ítems -->
          <ul v-else class="item-list" aria-label="Artículos en el carrito">
            <li
              v-for="item in cartItems"
              :key="item.id"
              class="item-row"
            >
              <img
                :src="resolveProductImage(item.product)"
                :alt="item.product.name"
                class="item-thumbnail"
                loading="lazy"
                width="56"
                height="56"
              />
              <div class="item-info">
                <span class="item-name">{{ item.product.name }}</span>
                <span class="item-meta">
                  Cant.: {{ item.quantity }} &times; {{ Number(item.product.price).toFixed(2) }} €
                </span>
              </div>
              <span class="item-subtotal">
                {{ (item.quantity * item.product.price).toFixed(2) }} €
              </span>
            </li>
          </ul>

          <!-- Separador -->
          <hr class="summary-divider" />

          <!-- Desglose Financiero — Iteración 5, Tarea 2 -->
          <!-- Los totales provienen de los getters de precisión de useCartStore -->
          <dl class="financial-breakdown">
            <div class="breakdown-row">
              <dt>Subtotal ({{ itemsCount }} art.)</dt>
              <dd>{{ subtotal.toFixed(2) }} €</dd>
            </div>
            <div class="breakdown-row">
              <dt>IVA (21 %)</dt>
              <dd>{{ taxAmount.toFixed(2) }} €</dd>
            </div>
            <div class="breakdown-row breakdown-row--total">
              <dt>Total</dt>
              <dd class="total-amount">{{ total.toFixed(2) }} €</dd>
            </div>
          </dl>

          <!-- Insignia de seguridad -->
          <div class="security-badge" aria-label="Pago seguro simulado">
            <span aria-hidden="true">🔒</span>
            <span>Pago 100 % seguro y simulado</span>
          </div>
        </div>

        <!-- Botón de volver al carrito -->
        <button
          id="back-to-cart-btn"
          class="cta-btn cta-btn--ghost"
          @click="goToCart"
          aria-label="Volver al carrito"
        >
          ← Volver al carrito
        </button>
      </aside>
    </div>
  </main>
</template>

<style scoped>
/* ── Contenedor principal ── */
.checkout-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
}

/* ── Cabecera ── */
.checkout-header {
  margin-bottom: 2.5rem;
}

.checkout-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  letter-spacing: -0.5px;
}

.checkout-subtitle {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin-top: 0.35rem;
}

/* ── Layout de dos columnas ── */
.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
  align-items: start;
}

/* ── Columna Formulario ── */
.checkout-form-column {
  /* La columna del form ocupa todo el espacio restante */
}

/* ── Panel de Resumen ── */
.summary-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 1.75rem;
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 80px; /* Compensa la altura del AppNavbar */
}

.summary-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: 1.25rem;
  letter-spacing: -0.2px;
}

/* ── Lista de ítems ── */
.item-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  max-height: 320px;
  overflow-y: auto;
  padding-right: 0.25rem;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.item-thumbnail {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
}

.item-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-text);
  /* Corta el nombre si es muy largo */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.item-subtotal {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text);
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── Divisor ── */
.summary-divider {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 1.25rem 0;
}

/* ── Desglose Financiero ── */
.financial-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.breakdown-row dt { font-weight: 500; }
.breakdown-row dd { font-weight: 600; font-variant-numeric: tabular-nums; }

.breakdown-row--total {
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 2px solid var(--color-border);
  color: var(--color-text);
}

.breakdown-row--total dt { font-size: 1rem; font-weight: 700; }

.total-amount {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--color-accent);
  letter-spacing: -0.3px;
}

/* ── Insignia de seguridad ── */
.security-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  margin-top: 1.25rem;
  padding: 0.6rem;
  background-color: hsl(142, 70%, 96%);
  border-radius: 8px;
  font-size: 0.8rem;
  color: hsl(142, 60%, 30%);
  font-weight: 600;
}

/* ── Botones de acción ── */
.cta-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  width: 100%;
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  font-family: var(--font-sans);
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast),
    background-color var(--transition-fast);
  border: none;
  text-align: center;
}

.cta-btn--primary {
  background-color: var(--color-accent);
  color: var(--color-primary);
  box-shadow: 0 4px 14px hsla(36, 100%, 50%, 0.35);
}

.cta-btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px hsla(36, 100%, 50%, 0.5);
}

.cta-btn--ghost {
  background-color: transparent;
  color: var(--color-text-muted);
  border: 1.5px solid var(--color-border);
  margin-top: 0.75rem;
}

.cta-btn--ghost:hover {
  background-color: var(--color-background);
  color: var(--color-text);
  border-color: var(--color-text-muted);
}

.link-btn {
  background: none;
  border: none;
  color: var(--color-accent);
  font-weight: 700;
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: inherit;
  text-decoration: underline;
  padding: 0;
}

.empty-cart-notice {
  text-align: center;
  color: var(--color-text-muted);
  padding: 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  font-size: 0.9rem;
}

/* ══ Pantalla de Confirmación ══ */
.confirmation-panel {
  max-width: 520px;
  margin: 3rem auto;
  text-align: center;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 3rem 2.5rem;
  box-shadow: var(--shadow-lg);
  animation: confirmSlideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes confirmSlideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
}

.confirmation-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s both;
}

@keyframes popIn {
  from { transform: scale(0); }
  to   { transform: scale(1); }
}

.confirmation-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: 0.6rem;
  letter-spacing: -0.4px;
}

.confirmation-body {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.confirmation-details {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  background-color: var(--color-background);
  border-radius: 10px;
  padding: 1.25rem 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.detail-row dt {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.detail-highlight {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text);
}

.tracking-code {
  font-family: 'Courier New', monospace;
  font-size: 0.95rem;
  color: var(--color-accent);
  letter-spacing: 0.5px;
}

/* ── Responsividad ── */
@media (max-width: 900px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }

  .summary-card {
    position: static;
    order: -1; /* El resumen aparece primero en móvil */
  }

  .checkout-title {
    font-size: 1.4rem;
  }
}

@media (max-width: 600px) {
  .checkout-view {
    padding: 1.5rem 1rem 3rem;
  }

  .confirmation-panel {
    padding: 2rem 1.25rem;
  }
}
</style>
