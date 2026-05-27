<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useProductStore } from '@/store/products';
import { useCartStore } from '@/store/cart';
import AppNavbar from '@/components/organisms/AppNavbar.vue';

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const cartStore = useCartStore();

const { totalItemsCount } = storeToRefs(cartStore);

const { loading, error } = storeToRefs(productStore);

const product = ref(null);
const quantity = ref(1);
const isAdding = ref(false);
const showSuccessMessage = ref(false);

// Parámetro dinámico de la URL (soporta id o sku indistintamente por robustez)
const productSku = computed(() => route.params.sku || route.params.id);

onMounted(async () => {
  if (productSku.value) {
    try {
      product.value = await productStore.fetchProductBySku(productSku.value);
    } catch (err) {
      console.error('Error al recuperar la ficha del producto:', err);
    }
  }
});

// Comprueba disponibilidad en stock
const isAvailable = computed(() => {
  return (product.value?.stock ?? 0) > 0;
});

// Formatea el precio a euros
const formattedPrice = computed(() => {
  const price = parseFloat(product.value?.price);
  return isNaN(price) ? '0,00 €' : `${price.toFixed(2).replace('.', ',')} €`;
});

// Incrementa la cantidad asegurando no superar el stock
const incrementQuantity = () => {
  if (quantity.value < product.value.stock) {
    quantity.value++;
  }
};

// Decrementa la cantidad asegurando no bajar de 1
const decrementQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

// Valida y limpia la cantidad al escribir manualmente en el input
const handleQuantityInput = (event) => {
  let val = parseInt(event.target.value, 10);
  if (isNaN(val) || val < 1) {
    quantity.value = 1;
  } else if (val > product.value.stock) {
    quantity.value = product.value.stock;
  } else {
    quantity.value = val;
  }
};

// Acción de añadir al carrito
const handleAddToCart = async () => {
  if (!product.value || !isAvailable.value) return;

  isAdding.value = true;
  showSuccessMessage.value = false;

  try {
    // Llama a la acción de useCartStore de forma limpia y transparente (SOLID)
    await cartStore.addItem(product.value, quantity.value);
    showSuccessMessage.value = true;
    
    // Ocultar mensaje de éxito tras 3 segundos
    setTimeout(() => {
      showSuccessMessage.value = false;
    }, 3000);
  } catch (err) {
    alert(err.message || 'No se pudo añadir el producto al carrito.');
  } finally {
    isAdding.value = false;
  }
};

// Vuelve a la vista de catálogo
const handleBack = () => {
  router.push('/catalog');
};

const handleNavigation = (destination) => {
  if (destination === 'Login') {
    router.push({ name: 'Login' });
  } else if (destination === 'Catalog') {
    router.push({ name: 'Catalog' });
  } else if (destination === 'cart') {
    router.push({ name: 'Cart' });
  } else if (destination === 'Home') {
    router.push({ name: 'Home' });
  }
};
</script>

<template>
  <div class="product-detail-layout-container">
    <AppNavbar 
      :cart-count="totalItemsCount"
      @navigate="handleNavigation"
    />

    <main class="product-detail-view" aria-label="Detalle de producto">
    
    <!-- ─── Enlace de Retorno (Breadcrumbs) ─── -->
    <nav class="detail-nav" aria-label="Navegación de retorno">
      <button class="back-link-btn" @click="handleBack" aria-label="Volver al catálogo de productos">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2.5" 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          class="back-arrow"
          aria-hidden="true"
        >
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Volver al catálogo
      </button>
    </nav>

    <!-- ─── Estado de Carga (Spinner) ─── -->
    <section v-if="loading" class="detail-status-panel" aria-busy="true">
      <div class="spinner"></div>
      <p>Cargando ficha técnica del producto...</p>
    </section>

    <!-- ─── Estado de Error ─── -->
    <section v-else-if="error || !product" class="detail-status-panel error-panel" role="alert">
      <div class="status-icon">⚠️</div>
      <h2>No se pudo cargar el producto</h2>
      <p>{{ error || 'El artículo que buscas no existe o se ha descatalogado.' }}</p>
      <button class="cta-back-btn" @click="handleBack">Regresar a la Tienda</button>
    </section>

    <!-- ─── Ficha Técnica Nominal (Layout Principal) ─── -->
    <article v-else class="product-detail-layout">
      
      <!-- Columna Izquierda: Imagen del Producto -->
      <section class="detail-media-column" aria-label="Imagen del producto">
        <div class="image-card">
          <img 
            :src="product.image_urls?.[0] || 'https://placehold.co/600x400/131921/FF9900?text=' + encodeURIComponent(product.name)" 
            :alt="'Fotografía de ' + product.name" 
            class="detail-image"
          />
        </div>
      </section>

      <!-- Columna Derecha: Información y Compra -->
      <section class="detail-info-column" aria-label="Especificaciones y compra">
        
        <!-- Datos de Categoría y SKU -->
        <div class="info-header">
          <span class="detail-sku">SKU: <code>{{ product.sku }}</code></span>
          <span class="detail-category">Catálogo: NebriAmazon</span>
        </div>

        <!-- Título -->
        <h1 class="detail-title">{{ product.name }}</h1>

        <!-- Precio -->
        <div class="detail-price-wrapper">
          <span class="detail-price" aria-label="Precio">{{ formattedPrice }}</span>
          <span class="tax-notice">IVA incluido (21%)</span>
        </div>

        <hr class="divider" />

        <!-- Descripción -->
        <div class="description-section">
          <h2 class="section-title">Descripción del Producto</h2>
          <p class="description-text">{{ product.description }}</p>
        </div>

        <hr class="divider" />

        <!-- Ficha de Compra y Control de Stock -->
        <div class="purchase-box-card">
          
          <!-- Disponibilidad -->
          <div class="stock-status-row">
            <span class="status-label">Disponibilidad:</span>
            <span 
              class="status-indicator" 
              :class="{ 'in-stock': isAvailable, 'out-of-stock': !isAvailable }"
            >
              {{ isAvailable ? `En Stock (${product.stock} unidades)` : 'Agotado Temporalmente' }}
            </span>
          </div>

          <!-- Formulario de Cantidad y Compra (Solo si hay stock) -->
          <div v-if="isAvailable" class="action-form">
            <div class="quantity-selector-row">
              <label for="detail-qty" class="quantity-label">Cantidad:</label>
              <div class="quantity-selector-wrapper">
                <button 
                  type="button" 
                  class="qty-btn" 
                  @click="decrementQuantity" 
                  :disabled="quantity <= 1"
                  aria-label="Disminuir cantidad"
                >
                  &minus;
                </button>
                <input
                  id="detail-qty"
                  type="number"
                  :value="quantity"
                  @change="handleQuantityInput"
                  class="quantity-input"
                  min="1"
                  :max="product.stock"
                  aria-label="Cantidad de unidades"
                />
                <button 
                  type="button" 
                  class="qty-btn" 
                  @click="incrementQuantity" 
                  :disabled="quantity >= product.stock"
                  aria-label="Aumentar cantidad"
                >
                  &plus;
                </button>
              </div>
            </div>

            <!-- Botón Principal "Añadir al Carrito" -->
            <button 
              class="add-to-cart-btn" 
              @click="handleAddToCart"
              :disabled="isAdding"
              :aria-busy="isAdding"
              aria-label="Añadir este artículo al carrito de compras"
            >
              <span v-if="isAdding" class="btn-spinner"></span>
              <span v-else>🛒 Añadir al Carrito</span>
            </button>
          </div>

          <!-- Botón Deshabilitado si no hay Stock -->
          <button 
            v-else 
            class="add-to-cart-btn disabled-btn" 
            disabled 
            aria-disabled="true"
          >
            Agotado temporalmente
          </button>

          <!-- Feedback interactivo animado -->
          <Transition name="fade">
            <div v-if="showSuccessMessage" class="cart-toast-feedback" role="status">
              <span class="toast-icon">✓</span>
              <span>¡Añadido con éxito! ({{ quantity }} unidades)</span>
            </div>
          </Transition>

        </div>

      </section>

    </article>
  </main>
  </div>
</template>

<style scoped>
.product-detail-layout-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--color-background);
  font-family: var(--font-sans);
}

.product-detail-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem 4rem;
}

/* Navegación Retorno */
.detail-nav {
  margin-bottom: 2rem;
}

.back-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  font-family: var(--font-sans);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-primary);
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: all var(--transition-fast);
  outline: none;
}

.back-link-btn:hover {
  color: var(--color-accent-hover);
  background-color: var(--color-border);
}

.back-arrow {
  width: 16px;
  height: 16px;
  transition: transform var(--transition-fast);
}

.back-link-btn:hover .back-arrow {
  transform: translateX(-4px);
}

.back-link-btn:focus-visible {
  outline: 2px solid var(--color-accent);
}

/* Spinner e Interfaces Auxiliares */
.detail-status-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 6rem 2rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  max-width: 600px;
  margin: 2rem auto;
}

.status-icon {
  font-size: 4rem;
  line-height: 1;
  margin-bottom: 1rem;
}

.detail-status-panel h2 {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--color-text);
  margin-bottom: 0.5rem;
}

.detail-status-panel p {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}

.cta-back-btn {
  padding: 0.75rem 1.5rem;
  background-color: var(--color-primary-light);
  color: var(--color-surface);
  border: none;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.cta-back-btn:hover {
  background-color: var(--color-primary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin-anim 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin-anim {
  to { transform: rotate(360deg); }
}

/* Layout de la Ficha Técnica */
.product-detail-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}

/* Columna de la Imagen */
.image-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  object-fit: contain;
}

/* Columna de Información */
.detail-info-column {
  display: flex;
  flex-direction: column;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.detail-sku {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  font-weight: 600;
}

.detail-sku code {
  font-family: 'Courier New', monospace;
  font-weight: 700;
  color: var(--color-text);
  background-color: var(--color-background);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

.detail-category {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--color-accent-hover);
  font-weight: 700;
}

.detail-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-primary);
  line-height: 1.25;
  margin: 0 0 1rem;
  letter-spacing: -0.5px;
}

.detail-price-wrapper {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.detail-price {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--color-accent-hover);
  letter-spacing: -0.5px;
}

.tax-notice {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  font-weight: 500;
}

.divider {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 1.5rem 0;
}

/* Descripción */
.section-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-text);
  margin: 0 0 0.5rem;
}

.description-text {
  font-size: 0.95rem;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin: 0;
}

/* Caja de Compra */
.purchase-box-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.stock-status-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text);
}

.status-indicator {
  font-size: 0.88rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
}

.status-indicator.in-stock {
  background-color: hsla(142, 70%, 45%, 0.1);
  color: var(--color-success);
}

.status-indicator.out-of-stock {
  background-color: hsla(0, 84%, 60%, 0.1);
  color: var(--color-error);
}

.action-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.quantity-selector-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.quantity-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text);
}

.quantity-selector-wrapper {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.qty-btn {
  background: none;
  border: none;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text);
  width: 36px;
  height: 36px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition-fast);
}

.qty-btn:hover:not(:disabled) {
  background-color: var(--color-background);
}

.qty-btn:disabled {
  color: var(--color-border);
  cursor: not-allowed;
}

.quantity-input {
  border: none;
  border-left: 1.5px solid var(--color-border);
  border-right: 1.5px solid var(--color-border);
  width: 44px;
  height: 36px;
  text-align: center;
  font-family: var(--font-sans);
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text);
  outline: none;
  -moz-appearance: textfield;
}

.quantity-input::-webkit-outer-spin-button,
.quantity-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Botón Añadir al Carrito */
.add-to-cart-btn {
  width: 100%;
  padding: 0.9rem 1.5rem;
  background-color: var(--color-accent);
  color: var(--color-primary);
  font-weight: 800;
  font-family: var(--font-sans);
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 4px 12px hsla(36, 100%, 50%, 0.3);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  outline: none;
}

.add-to-cart-btn:hover:not(:disabled) {
  background-color: var(--color-accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 18px hsla(36, 100%, 50%, 0.45);
}

.add-to-cart-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.add-to-cart-btn:disabled {
  background-color: var(--color-border);
  color: var(--color-text-muted);
  box-shadow: none;
  cursor: not-allowed;
}

.btn-spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(19, 25, 33, 0.2);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin-anim 0.8s linear infinite;
}

.add-to-cart-btn:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}

/* Retroalimentación Interactiva */
.cart-toast-feedback {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.65rem;
  background-color: hsl(142, 70%, 96%);
  border: 1px solid hsla(142, 70%, 45%, 0.2);
  color: hsl(142, 60%, 30%);
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  text-align: center;
}

.toast-icon {
  font-size: 1rem;
}

/* Transiciones */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsividad */
@media (max-width: 800px) {
  .product-detail-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .detail-title {
    font-size: 1.6rem;
  }

  .detail-price {
    font-size: 1.8rem;
  }
}
</style>
