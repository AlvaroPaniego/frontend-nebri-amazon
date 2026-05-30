<script setup>
/**
 * src/views/OrdersHistoryView.vue
 * ─────────────────────────────────────────────────────────────
 * Historial y Estado de Pedidos del Usuario (Hito Extra)
 *
 * Características Clave:
 *   1. Integrado con Pinia mediante useOrdersStore y storeToRefs.
 *   2. Desacoplamiento total: los datos se solicitan al montar y se mapean en la vista.
 *   3. Visuales Premium: Shimmer skeleton loaders para mitigar el CLS.
 *   4. Badges de estado HSL dinámicos y transparentes de alta calidad.
 *   5. Acoplamiento reactivo con useProductStore para resolver nombres y miniaturas de productos.
 *   6. Semántica e interactividad accesible con etiquetas ARIA completas.
 *
 * Aplicando principios de Clean Code (Uncle Bob) de forma estricta.
 */

import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useOrdersStore } from '@/store/orders';
import { useProductStore } from '@/store/products';
import { useAuthStore } from '@/store/auth';
import AppNavbar from '@/components/organisms/AppNavbar.vue';

const router = useRouter();

// Stores
const ordersStore = useOrdersStore();
const productStore = useProductStore();
const authStore = useAuthStore();

// Referencias reactivas desacopladas
const { orders, loading, error } = storeToRefs(ordersStore);
const { products } = storeToRefs(productStore);
const { isAuthenticated } = storeToRefs(authStore);

// Estado local para controlar qué pedidos tienen el desglose expandido
const expandedOrders = ref({});

// Al montar el componente
onMounted(async () => {
  // Redirección segura si no hay sesión
  if (!isAuthenticated.value) {
    router.push({ name: 'Login' });
    return;
  }

  // Carga concurrente del historial de pedidos y del catálogo de productos para la caché
  try {
    await Promise.all([
      ordersStore.fetchUserOrders(),
      productStore.fetchProducts()
    ]);
  } catch (err) {
    // Captura limpia reportada en la UI a través del estado reactivo del store
    console.error('Error durante la carga inicial del historial:', err);
  }
});

// Acción para alternar la visibilidad de los detalles de un pedido
const toggleOrderDetails = (orderId) => {
  expandedOrders.value[orderId] = !expandedOrders.value[orderId];
};

// Formateadores localizados (evitando números o transformaciones mágicas)
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'long',
    timeStyle: 'short'
  }).format(new Date(dateString));
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR'
  }).format(Number(amount));
};

// Obtiene los datos detallados del producto desde la caché reactiva
const resolveProductData = (productId) => {
  // Intentamos buscar por coincidencia exacta de ID
  const matched = products.value.find(p => Number(p.id) === Number(productId));
  
  if (matched) {
    return {
      name: matched.name,
      sku: matched.sku,
      image: matched.image_urls?.[0] || matched.image || ''
    };
  }

  // Retorno defensivo con placeholders limpios
  return {
    name: `Producto de NebriAmazon (Ref: #${productId})`,
    sku: null,
    image: ''
  };
};

const resolveProductImage = (productId) => {
  const data = resolveProductData(productId);
  return data.image || `https://placehold.co/64x64/131921/FF9900?text=${encodeURIComponent(data.name[0] || 'N')}`;
};

// Asignación de estilos dinámicos HSL y etiquetas localizadas según el estado
const getStatusBadgeConfig = (status) => {
  const normalized = status?.toLowerCase() || '';

  if (normalized.includes('entreg') || normalized.includes('deliv')) {
    return {
      bg: 'hsla(142, 60%, 30%, 0.1)',
      color: 'hsl(142, 60%, 30%)',
      label: 'Entregado'
    };
  }

  if (normalized.includes('envi') || normalized.includes('shipp')) {
    return {
      bg: 'hsla(217, 91%, 60%, 0.1)',
      color: 'hsl(217, 91%, 60%)',
      label: 'Enviado'
    };
  }

  // Default: Procesando / Pendiente
  return {
    bg: 'hsla(36, 100%, 50%, 0.15)',
    color: 'hsl(27, 98%, 53%)',
    label: 'Procesando'
  };
};

// Navegaciones rápidas
const goToCatalog = () => router.push({ name: 'Catalog' });
const goToProduct = (sku) => {
  if (sku) {
    router.push({ name: 'ProductDetail', params: { id: sku } });
  }
};
</script>

<template>
  <div class="orders-history-page">
    <AppNavbar />

    <main class="orders-container" aria-label="Historial de Pedidos de NebriAmazon">
      <!-- Cabecera de la sección -->
      <header class="orders-header">
        <h1 class="orders-title">Mis Pedidos</h1>
        <p class="orders-subtitle">Consulta el estado, historial y desglose de todas tus compras simuladas.</p>
      </header>

      <!-- ══ A) ESTADO DE CARGA (Skeleton Loader Shimmer) ══ -->
      <section 
        v-if="loading && orders.length === 0" 
        class="skeleton-container" 
        aria-hidden="true"
      >
        <div v-for="n in 3" :key="n" class="skeleton-card">
          <div class="skeleton-header">
            <div class="skeleton-block skeleton-id"></div>
            <div class="skeleton-block skeleton-date"></div>
            <div class="skeleton-block skeleton-price"></div>
            <div class="skeleton-block skeleton-status"></div>
          </div>
          <div class="skeleton-body"></div>
        </div>
      </section>

      <!-- ══ B) ESTADO VACÍO / ERROR (Vacío Inteligente) ══ -->
      <section 
        v-else-if="orders.length === 0 || error" 
        class="empty-orders-card"
        aria-live="polite"
      >
        <div class="empty-icon" aria-hidden="true">📦</div>
        <h2 class="empty-title">{{ error ? 'Ha ocurrido un inconveniente' : 'Aún no tienes pedidos' }}</h2>
        <p class="empty-text">
          {{ error ? 'Hubo un error de conexión de red al recuperar tus pedidos. Por favor, asegúrate de que el servidor esté activo.' : 'Cuando realices una compra de manera segura e interactiva, verás el historial detallado de tus transacciones y envíos aquí.' }}
        </p>
        <button 
          class="cta-catalog-btn" 
          @click="goToCatalog"
          aria-label="Volver al catálogo para explorar artículos"
        >
          Explorar Catálogo
        </button>
      </section>

      <!-- ══ C) ESTADO CON DATOS (Lista de Pedidos) ══ -->
      <section v-else class="orders-list-panel" aria-live="polite">
        <div class="orders-count-summary">
          <span>Mostrando <strong>{{ orders.length }}</strong> {{ orders.length === 1 ? 'pedido realizado' : 'pedidos realizados' }}.</span>
        </div>

        <article 
          v-for="order in orders" 
          :key="order.id" 
          class="order-card"
          :class="{ 'expanded': expandedOrders[order.id] }"
        >
          <!-- Cabecera de la Tarjeta del Pedido -->
          <div class="order-card-header">
            <!-- Detalles Principales del Pedido -->
            <div class="order-meta-info">
              <div class="meta-item">
                <span class="meta-label">PEDIDO REALIZADO</span>
                <span class="meta-value">{{ formatDate(order.created_at) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">TOTAL COBRADO</span>
                <span class="meta-value highlight-price">{{ formatCurrency(order.total_price) }}</span>
              </div>
              <div class="meta-item order-id-item">
                <span class="meta-label">ID DE PEDIDO</span>
                <span class="meta-value monospace-id">#{{ order.id }}</span>
              </div>
            </div>

            <!-- Badge de Estado HSL & Botón de Desglose -->
            <div class="order-status-actions">
              <span 
                class="status-badge"
                :style="{ 
                  backgroundColor: getStatusBadgeConfig(order.status).bg, 
                  color: getStatusBadgeConfig(order.status).color 
                }"
              >
                <span class="status-indicator-dot" :style="{ backgroundColor: getStatusBadgeConfig(order.status).color }"></span>
                {{ getStatusBadgeConfig(order.status).label }}
              </span>

              <button 
                class="toggle-details-btn"
                @click="toggleOrderDetails(order.id)"
                :aria-expanded="expandedOrders[order.id] ? 'true' : 'false'"
                :aria-label="'Ver detalles del pedido número ' + order.id"
              >
                <span>{{ expandedOrders[order.id] ? 'Ocultar Detalles' : 'Ver Detalles' }}</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="2" 
                  stroke-linecap="round" 
                  stroke-linejoin="round" 
                  class="chevron-icon"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
          </div>

          <!-- Desglose Colapsable del Pedido (Accordion) -->
          <div 
            class="order-card-body" 
            :class="{ 'visible': expandedOrders[order.id] }"
            :aria-hidden="!expandedOrders[order.id]"
          >
            <div class="body-inner-container">
              <h3 class="breakdown-title">Artículos en este pedido</h3>
              
              <!-- Si el pedido no contiene productos estructurados (defensivo) -->
              <div v-if="!order.items || order.items.length === 0" class="no-items-notice">
                No hay información disponible sobre los productos de este pedido.
              </div>

              <!-- Listado de artículos incluidos -->
              <ul v-else class="order-items-list" aria-label="Productos en el pedido">
                <li 
                  v-for="item in order.items" 
                  :key="item.product_id"
                  class="order-item-row"
                >
                  <img 
                    :src="resolveProductImage(item.product_id)"
                    :alt="resolveProductData(item.product_id).name"
                    class="item-image"
                    loading="lazy"
                    width="64"
                    height="64"
                  />

                  <div class="item-details">
                    <span 
                      class="item-name" 
                      :class="{ 'clickable-link': resolveProductData(item.product_id).sku }"
                      @click="goToProduct(resolveProductData(item.product_id).sku)"
                      role="button"
                      tabindex="0"
                    >
                      {{ resolveProductData(item.product_id).name }}
                    </span>
                    <span class="item-meta">
                      Cantidad: <strong>{{ item.quantity }}</strong> &times; {{ formatCurrency(item.price_snapshot || 0) }}
                    </span>
                  </div>

                  <div class="item-total-cost">
                    <span class="cost-label">Subtotal</span>
                    <span class="cost-value">{{ formatCurrency((item.quantity || 0) * (item.price_snapshot || 0)) }}</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* Contenedor Principal */
.orders-history-page {
  background-color: var(--color-background);
  min-height: 100vh;
}

.orders-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 5rem;
}

/* Cabecera */
.orders-header {
  margin-bottom: 2.5rem;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 1.5rem;
}

.orders-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-primary);
  margin: 0 0 0.5rem;
  letter-spacing: -0.8px;
}

.orders-subtitle {
  font-size: 0.95rem;
  color: var(--color-text-muted);
  margin: 0;
  line-height: 1.5;
}

/* ══ A) SKELETON SHIMMER LOADERS ══ */
.skeleton-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.skeleton-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-header {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: center;
}

.skeleton-block {
  height: 16px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--color-background) 25%, var(--color-border) 37%, var(--color-background) 63%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-id { width: 140px; height: 18px; }
.skeleton-date { width: 180px; }
.skeleton-price { width: 100px; }
.skeleton-status { width: 110px; margin-left: auto; height: 26px; border-radius: 13px; }

.skeleton-body {
  height: 60px;
  background: var(--color-background);
  border-radius: 8px;
  opacity: 0.5;
}

/* ══ B) ESTADO VACÍO / ERROR ══ */
.empty-orders-card {
  text-align: center;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 4rem 2.5rem;
  box-shadow: var(--shadow-md);
  max-width: 600px;
  margin: 3rem auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.empty-icon {
  font-size: 4.5rem;
  line-height: 1;
  margin-bottom: 0.5rem;
  filter: drop-shadow(0 4px 10px rgba(0,0,0,0.06));
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-text);
  margin: 0;
  letter-spacing: -0.4px;
}

.empty-text {
  font-size: 0.95rem;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin: 0 0 1rem;
}

.cta-catalog-btn {
  background-color: var(--color-accent);
  color: var(--color-primary);
  border: none;
  font-family: var(--font-sans);
  font-size: 0.9rem;
  font-weight: 700;
  padding: 0.8rem 2rem;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 12px hsla(36, 100%, 50%, 0.3);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.cta-catalog-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px hsla(36, 100%, 50%, 0.45);
}

/* ══ C) LISTADO DE PEDIDOS (Datos) ══ */
.orders-list-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.orders-count-summary {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  border-bottom: 1px dashed var(--color-border);
  padding-bottom: 0.75rem;
  margin-bottom: 0.5rem;
}

.orders-count-summary strong {
  color: var(--color-text);
}

/* Ficha del Pedido */
.order-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-fast), border-color var(--transition-fast);
}

.order-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-text-muted);
}

.order-card.expanded {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-md);
}

/* Cabecera de Ficha */
.order-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background-color: var(--color-surface);
  border-bottom: 1px solid transparent;
  flex-wrap: wrap;
  gap: 1.25rem;
  transition: background-color var(--transition-fast), border-color var(--transition-fast);
}

.order-card.expanded .order-card-header {
  background-color: var(--color-background);
  border-bottom-color: var(--color-border);
}

/* Detalles Meta */
.order-meta-info {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.meta-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-muted);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.meta-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
}

.highlight-price {
  font-weight: 800;
  color: var(--color-accent-hover);
}

.monospace-id {
  font-family: monospace;
  font-size: 0.95rem;
  color: var(--color-text);
}

/* Acciones y Status */
.order-status-actions {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 0.9rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.2px;
}

.status-indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.toggle-details-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  font-family: var(--font-sans);
  font-size: 0.82rem;
  font-weight: 700;
  padding: 0.45rem 0.85rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all var(--transition-fast);
  outline: none;
}

.toggle-details-btn:hover {
  background-color: var(--color-background);
  border-color: var(--color-text-muted);
}

.chevron-icon {
  width: 16px;
  height: 16px;
  transition: transform var(--transition-fast) cubic-bezier(0.4, 0, 0.2, 1);
}

.order-card.expanded .chevron-icon {
  transform: rotate(180deg);
}

/* Desglose Colapsable */
.order-card-body {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.order-card-body.visible {
  max-height: 800px; /* Suficiente para acomodar varios artículos */
}

.body-inner-container {
  padding: 1.5rem;
  background-color: var(--color-surface);
}

.breakdown-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--color-text);
  margin: 0 0 1rem;
  border-left: 3px solid var(--color-accent);
  padding-left: 0.6rem;
}

.no-items-notice {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  text-align: center;
  padding: 1rem 0;
}

/* Listado de Artículos */
.order-items-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.order-item-row {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--color-background);
}

.order-item-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.item-image {
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  flex-shrink: 0;
  background-color: var(--color-background);
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.4;
  outline: none;
  max-width: 500px;
}

.clickable-link {
  cursor: pointer;
  transition: color var(--transition-fast);
}

.clickable-link:hover, .clickable-link:focus-visible {
  color: var(--color-accent-hover);
  text-decoration: underline;
}

.item-meta {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.item-meta strong {
  color: var(--color-text);
}

.item-total-cost {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex-shrink: 0;
}

.cost-label {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.2px;
}

.cost-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

/* Responsividad */
@media (max-width: 768px) {
  .orders-container {
    padding: 1.5rem 1rem 4rem;
  }

  .order-card-header {
    padding: 1.25rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .order-meta-info {
    gap: 1rem;
    width: 100%;
  }

  .meta-item {
    flex: 1 1 40%;
  }

  .order-id-item {
    flex: 1 1 100%;
  }

  .order-status-actions {
    width: 100%;
    justify-content: space-between;
  }

  .skeleton-id { width: 100px; }
  .skeleton-date { width: 120px; }
  .skeleton-status { margin-left: 0; }

  .order-item-row {
    align-items: flex-start;
    position: relative;
    padding-bottom: 2rem;
  }

  .item-total-cost {
    position: absolute;
    bottom: 0.25rem;
    left: 80px;
    text-align: left;
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
  }

  .cost-label {
    font-size: 0.75rem;
  }

  .cost-value {
    font-size: 0.85rem;
  }
}
</style>
