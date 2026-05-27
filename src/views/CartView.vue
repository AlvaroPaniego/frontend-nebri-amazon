<script setup>
/**
 * src/views/CartView.vue
 * ─────────────────────────────────────────────────────────────
 * Vista del Carrito de Compras de NebriAmazon.
 *
 * Ofrece una interfaz de dos columnas premium al estilo de comercio electrónico líder:
 *   1. Listado interactivo de productos con selección de cantidad y eliminación.
 *   2. Estado de carrito vacío ilustrativo y elegante.
 *   3. Panel financiero con subtotales, IVA y envío gratis dinámicos.
 *   4. Control reactivo mediante Pinia (useCartStore) y enrutamiento con Vue Router.
 */

import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useCartStore } from '@/store/cart';

import AppNavbar from '@/components/organisms/AppNavbar.vue';
import ChatbotWidget from '@/components/organisms/ChatbotWidget.vue';

const router = useRouter();
const cartStore = useCartStore();

// ─── Estado Reactivo de Pinia ─────────────────────────────────
const { items, loading, totalItemsCount, subtotal, taxAmount, total } = storeToRefs(cartStore);

// ─── Estado Local de Alertas ─────────────────────────────────
const errorMessage = ref('');

// ─── Métodos Auxiliares ───────────────────────────────────────
const resolveProductImage = (product) => {
  return product?.image_urls?.[0] ?? `https://placehold.co/120x120/131921/FF9900?text=${encodeURIComponent(product?.name?.[0] ?? '?')}`;
};

const goToCatalog = () => router.push({ name: 'Catalog' });
const goToCheckout = () => {
  if (items.value.length > 0) {
    router.push({ name: 'Checkout' });
  }
};

// ─── Manejo de Eventos de Navegación ──────────────────────────
const handleNavigation = (destination) => {
  if (destination === 'home') {
    router.push({ name: 'Home' });
  } else if (destination === 'Catalog') {
    goToCatalog();
  } else if (destination === 'Login') {
    router.push({ name: 'Login' });
  }
};

// ─── Acciones del Carrito (Reactividad + Validaciones) ────────
const handleQuantityChange = async (item, event) => {
  const newQty = parseInt(event.target.value, 10);
  errorMessage.value = '';
  
  try {
    await cartStore.updateItemQuantity(item.id, newQty);
  } catch (error) {
    errorMessage.value = error?.message || 'Error al actualizar la cantidad.';
    // Revertir el valor en la interfaz recargando el valor original
    event.target.value = item.quantity;
  }
};

const handleRemoveItem = async (itemId) => {
  errorMessage.value = '';
  try {
    await cartStore.removeItem(itemId);
  } catch (error) {
    errorMessage.value = 'Error al eliminar el artículo.';
  }
};
</script>

<template>
  <div class="cart-layout">
    <!-- ══ CABECERA GLOBAL ══════════════════════════════════════ -->
    <AppNavbar 
      :cart-count="totalItemsCount"
      @navigate="handleNavigation"
    />

    <!-- ══ CONTENIDO PRINCIPAL ══════════════════════════════════ -->
    <main class="cart-container" id="main-content" tabindex="-1">
      
      <!-- Banner de Error Dinámico -->
      <div v-if="errorMessage" class="error-banner" role="alert" aria-live="assertive">
        <span class="error-icon" aria-hidden="true">⚠️</span>
        {{ errorMessage }}
      </div>

      <!-- ══ VISTA VACÍA ELEGANTE ══ -->
      <section v-if="items.length === 0" class="empty-cart-panel" aria-label="Carrito vacío">
        <div class="empty-cart-card">
          <div class="empty-cart-illustration" aria-hidden="true">🛒</div>
          <h1 class="empty-cart-title">Tu carrito de NebriAmazon está vacío</h1>
          <p class="empty-cart-subtitle">
            Aún no has agregado ningún producto a tu cesta. Explora nuestro catálogo y descubre miles de ofertas exclusivas y envíos express.
          </p>
          <button 
            id="empty-cart-btn" 
            class="cta-btn cta-btn--primary" 
            @click="goToCatalog"
            aria-label="Volver al catálogo"
          >
            Volver a comprar
          </button>
        </div>
      </section>

      <!-- ══ ESTRUCTURA DE DOS COLUMNAS (Carrito Lleno) ══ -->
      <div v-else class="cart-grid">
        
        <!-- COLUMNA IZQUIERDA: Listado de Artículos -->
        <section class="cart-items-section" aria-label="Productos en tu carrito">
          <div class="cart-card">
            <header class="cart-header">
              <h1 class="cart-title">Carrito de compras</h1>
              <span class="cart-header-subtitle">Precio</span>
            </header>

            <!-- Lista de Artículos con Animación -->
            <transition-group name="list" tag="ul" class="cart-items-list">
              <li 
                v-for="item in items" 
                :key="item.id" 
                class="cart-item-row"
              >
                <!-- Imagen del Producto -->
                <div class="item-image-wrapper">
                  <img 
                    :src="resolveProductImage(item.product)" 
                    :alt="item.product.name" 
                    class="item-image"
                    loading="lazy"
                  />
                </div>

                <!-- Detalles e Interactividad -->
                <div class="item-details">
                  <h2 class="item-name">{{ item.product.name }}</h2>
                  <p class="item-sku">SKU: {{ item.product.sku }}</p>
                  
                  <!-- Stock info -->
                  <div class="item-stock-status">
                    <span v-if="item.product.stock > 3" class="stock-badge stock-badge--in">En stock</span>
                    <span v-else class="stock-badge stock-badge--low">Últimas {{ item.product.stock }} unidades</span>
                  </div>

                  <!-- Controles de Cantidad y Eliminación -->
                  <div class="item-actions">
                    <div class="qty-selector-wrapper">
                      <label :for="`qty-${item.id}`" class="qty-label">Cant:</label>
                      <select 
                        :id="`qty-${item.id}`"
                        class="qty-select"
                        :value="item.quantity"
                        :disabled="loading"
                        @change="handleQuantityChange(item, $event)"
                      >
                        <option 
                          v-for="n in Math.min(10, item.product.stock)" 
                          :key="n" 
                          :value="n"
                        >
                          {{ n }}
                        </option>
                      </select>
                    </div>

                    <span class="action-divider" aria-hidden="true">|</span>

                    <button 
                      class="delete-btn" 
                      :disabled="loading"
                      @click="handleRemoveItem(item.id)"
                      aria-label="Eliminar producto del carrito"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                <!-- Precio del Producto -->
                <div class="item-price-wrapper">
                  <span class="item-price">{{ Number(item.product.price).toFixed(2) }} €</span>
                </div>
              </li>
            </transition-group>

            <!-- Resumen de Subtotal Inferior (Estilo Amazon) -->
            <footer class="cart-footer-summary">
              Subtotal ({{ totalItemsCount }} {{ totalItemsCount === 1 ? 'producto' : 'productos' }}): 
              <strong class="summary-subtotal-amount">{{ subtotal.toFixed(2) }} €</strong>
            </footer>
          </div>
        </section>

        <!-- COLUMNA DERECHA: Resumen Financiero y Pago -->
        <aside class="cart-summary-section" aria-label="Resumen financiero">
          <div class="summary-card">
            
            <!-- Indicador de Envío Gratis -->
            <div class="shipping-info-badge" aria-live="polite">
              <span class="badge-check" aria-hidden="true">✓</span>
              <div class="badge-text-wrapper">
                <span class="badge-highlight">Tu pedido califica para envío GRATIS.</span>
                <span class="badge-subtext">Selecciona esta opción al finalizar la compra.</span>
              </div>
            </div>

            <!-- Subtotal de Tarjeta -->
            <div class="summary-subtotal">
              <span class="subtotal-label">
                Subtotal ({{ totalItemsCount }} {{ totalItemsCount === 1 ? 'producto' : 'productos' }}):
              </span>
              <strong class="subtotal-value">{{ subtotal.toFixed(2) }} €</strong>
            </div>

            <!-- Desglose de Gastos -->
            <dl class="summary-breakdown">
              <div class="breakdown-row">
                <dt>Envío</dt>
                <dd class="shipping-value">GRATIS</dd>
              </div>
              <div class="breakdown-row">
                <dt>Impuestos (21% IVA incl.)</dt>
                <dd>{{ taxAmount.toFixed(2) }} €</dd>
              </div>
              <hr class="breakdown-divider" />
              <div class="breakdown-row breakdown-row--total">
                <dt>Total final</dt>
                <dd class="total-value">{{ subtotal.toFixed(2) }} €</dd>
              </div>
            </dl>

            <!-- Botón de Pago Destacado -->
            <button 
              id="proceed-to-checkout-btn"
              class="checkout-submit-btn"
              :disabled="loading"
              @click="goToCheckout"
              aria-label="Proceder al pago de tus artículos"
            >
              Proceder al pago
            </button>

            <!-- Mensaje de Compra Segura -->
            <div class="security-lock" aria-label="Compra 100% segura">
              <span aria-hidden="true">🔒</span>
              Transacción 100% segura y protegida
            </div>
          </div>
          
          <!-- Botón secundario para seguir navegando -->
          <button 
            id="continue-shopping-btn" 
            class="cta-btn cta-btn--ghost" 
            @click="goToCatalog"
            aria-label="Seguir comprando y ver productos"
          >
            ← Seguir comprando
          </button>
        </aside>

      </div>
    </main>

    <!-- ══ CHATBOT FLOTANTE ══════════════════════════════════════ -->
    <ChatbotWidget />

    <!-- ══ PIE DE PÁGINA GLOBAL ══════════════════════════════════ -->
    <footer class="cart-footer" role="contentinfo">
      <div class="footer-inner">
        <span class="footer-brand" @click="goToHome" role="button" tabindex="0">
          Nebri<span class="brand-accent">Amazon</span>
        </span>
        <p class="footer-copy">
          © {{ new Date().getFullYear() }} NebriAmazon — Proyecto de Ingeniería de Software.
          Todos los derechos reservados.
        </p>
        <nav class="footer-nav" aria-label="Navegación del pie de página">
          <button class="footer-link" @click="goToCatalog">Catálogo</button>
          <span class="footer-sep" aria-hidden="true">·</span>
          <button class="footer-link" @click="handleNavigation('Login')">Mi Cuenta</button>
        </nav>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* ── Layout General ────────────────────────────────────────── */
.cart-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-background);
  font-family: var(--font-sans);
}

.cart-container {
  flex: 1;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.5rem 4rem;
}

/* ── Grid Principal ─────────────────────────────────────────── */
.cart-grid {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 2rem;
  align-items: start;
}

/* ── Tarjetas Base ──────────────────────────────────────────── */
.cart-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: var(--shadow-sm);
}

/* ── Cabecera del Listado ────────────────────────────────────── */
.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.75rem;
  margin-bottom: 1.5rem;
}

.cart-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--color-primary);
  letter-spacing: -0.5px;
  margin: 0;
}

.cart-header-subtitle {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

/* ── Lista de Artículos (Fila individual) ─────────────────────── */
.cart-items-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.cart-item-row {
  display: grid;
  grid-template-columns: 120px 1fr 100px;
  gap: 1.5rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--color-border);
  position: relative;
}

.cart-item-row:last-child {
  border-bottom: none;
}

/* Imagen del Producto */
.item-image-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
  height: 120px;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.cart-item-row:hover .item-image {
  transform: scale(1.04);
}

/* Detalles del Producto */
.item-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.item-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.35;
  margin-bottom: 0.25rem;
}

.item-sku {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-bottom: 0.5rem;
}

/* Insignias de Stock */
.item-stock-status {
  margin-bottom: 0.75rem;
}

.stock-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.stock-badge--in {
  background-color: hsl(142, 70%, 94%);
  color: var(--color-success);
}

.stock-badge--low {
  background-color: hsl(0, 84%, 96%);
  color: var(--color-error);
}

/* Acciones (Cantidad + Eliminar) */
.item-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: auto;
}

.qty-selector-wrapper {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.qty-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.qty-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background-color: var(--color-background);
  font-family: var(--font-sans);
  font-size: 0.85rem;
  color: var(--color-text);
  cursor: pointer;
  outline: none;
  transition: border-color var(--transition-fast);
}

.qty-select:focus {
  border-color: var(--color-accent);
}

.action-divider {
  color: var(--color-border);
  font-size: 0.85rem;
  user-select: none;
}

.delete-btn {
  background: none;
  border: none;
  color: var(--color-accent-hover);
  font-family: var(--font-sans);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  transition: color var(--transition-fast), background-color var(--transition-fast);
}

.delete-btn:hover:not(:disabled) {
  color: var(--color-primary);
  background-color: var(--color-background);
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Precio del artículo */
.item-price-wrapper {
  text-align: right;
}

.item-price {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--color-primary);
  letter-spacing: -0.3px;
}

/* Subtotal inferior */
.cart-footer-summary {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.05rem;
  color: var(--color-text);
  border-top: 1px solid var(--color-border);
  padding-top: 1.5rem;
  margin-top: 1.5rem;
}

.summary-subtotal-amount {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--color-primary);
}

/* ── Tarjeta Lateral de Subtotal (Resumen) ─────────────────── */
.summary-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 90px;
  text-align: left;
}

/* Insignia de Envío Gratis */
.shipping-info-badge {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  background-color: hsl(142, 70%, 96%);
  border: 1px solid hsl(142, 70%, 90%);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
}

.badge-check {
  color: var(--color-success);
  font-weight: 800;
  font-size: 1.1rem;
  line-height: 1;
}

.badge-text-wrapper {
  display: flex;
  flex-direction: column;
}

.badge-highlight {
  font-size: 0.78rem;
  font-weight: 700;
  color: hsl(142, 60%, 25%);
}

.badge-subtext {
  font-size: 0.7rem;
  color: hsl(142, 50%, 35%);
  margin-top: 0.1rem;
}

/* Subtotal Tarjeta */
.summary-subtotal {
  margin-bottom: 1rem;
}

.subtotal-label {
  display: block;
  font-size: 0.9rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.subtotal-value {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-primary);
  letter-spacing: -0.5px;
}

/* Desglose Financiero */
.summary-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.breakdown-row dt {
  font-weight: 500;
}

.breakdown-row dd {
  font-weight: 600;
  color: var(--color-text);
}

.shipping-value {
  color: var(--color-success) !important;
  font-weight: 700 !important;
}

.breakdown-divider {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 0.5rem 0;
}

.breakdown-row--total {
  color: var(--color-text);
}

.breakdown-row--total dt {
  font-size: 0.95rem;
  font-weight: 700;
}

.total-value {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-accent-hover);
}

/* Botón de Pago Destacado */
.checkout-submit-btn {
  width: 100%;
  padding: 0.85rem 1.5rem;
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
    box-shadow var(--transition-fast);
  box-shadow: 0 4px 12px hsla(36, 100%, 50%, 0.35);
  text-align: center;
  outline: none;
  margin-bottom: 1rem;
}

.checkout-submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px hsla(36, 100%, 50%, 0.5);
}

.checkout-submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.checkout-submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Insignia de seguridad */
.security-lock {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  color: var(--color-text-muted);
  font-weight: 600;
  text-align: center;
}

/* ── Botones CTA Auxiliares ────────────────────────────────── */
.cta-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-family: var(--font-sans);
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.cta-btn--primary {
  background-color: var(--color-accent);
  color: var(--color-primary);
  border: none;
  box-shadow: 0 4px 10px hsla(36, 100%, 50%, 0.3);
}

.cta-btn--primary:hover {
  background-color: var(--color-accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 14px hsla(36, 100%, 50%, 0.45);
}

.cta-btn--ghost {
  background-color: transparent;
  color: var(--color-text-muted);
  border: 1.5px solid var(--color-border);
  margin-top: 1rem;
}

.cta-btn--ghost:hover {
  background-color: var(--color-surface);
  border-color: var(--color-text-muted);
  color: var(--color-text);
}

/* ── Vista Vacía ───────────────────────────────────────────── */
.empty-cart-panel {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.empty-cart-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 4rem 3rem;
  box-shadow: var(--shadow-sm);
  max-width: 600px;
  text-align: center;
  animation: slideUp 0.4s ease-out;
}

.empty-cart-illustration {
  font-size: 4.5rem;
  line-height: 1;
  margin-bottom: 1.5rem;
  animation: pulse-icon 2s infinite;
}

.empty-cart-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-primary);
  margin-bottom: 0.75rem;
  letter-spacing: -0.5px;
}

.empty-cart-subtitle {
  font-size: 0.95rem;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin-bottom: 2rem;
}

#empty-cart-btn {
  max-width: 240px;
  margin: 0 auto;
}

@keyframes pulse-icon {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(15px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Banner de Error General ────────────────────────────────── */
.error-banner {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  background-color: hsl(0, 84%, 96%);
  border: 1px solid hsl(0, 84%, 80%);
  border-left: 4px solid var(--color-error);
  border-radius: 8px;
  color: hsl(0, 70%, 35%);
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 1.5rem;
  text-align: left;
  animation: slideUp 0.2s ease-out;
}

.error-icon {
  font-size: 1rem;
  flex-shrink: 0;
}

/* ── Animación de Lista de Transición (Transitions) ──────────── */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.list-leave-active {
  position: absolute;
  width: 100%;
}

/* ── Responsividad ── */
@media (max-width: 960px) {
  .cart-grid {
    grid-template-columns: 1fr;
  }
  
  .summary-card {
    position: static;
  }
  
  .cart-item-row {
    grid-template-columns: 90px 1fr;
    gap: 1rem;
  }
  
  .item-price-wrapper {
    grid-column: 2;
    text-align: left;
    margin-top: 0.5rem;
  }
}
</style>
