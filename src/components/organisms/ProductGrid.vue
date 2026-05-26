<script setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useProductStore } from '@/store/products';
import ProductCard from '../atoms/ProductCard.vue';

const productStore = useProductStore();
const { loading, error } = storeToRefs(productStore);

// Obtiene los productos filtrados reactivos desde el store
const filteredProducts = computed(() => productStore.getFilteredProducts);

// Limpia los filtros si el usuario lo desea mediante el botón
const handleResetFilters = () => {
  productStore.resetFilters();
};
</script>

<template>
  <div class="product-grid-container">
    <!-- Mensaje de Error de Red -->
    <div v-if="error" class="grid-message error-message" role="alert">
      <span class="icon">⚠️</span>
      <p>{{ error }}</p>
      <button class="retry-button" @click="productStore.fetchProducts(true)">
        Reintentar Carga
      </button>
    </div>

    <!-- 1. Estado de Carga: Skeleton Loaders para prevenir CLS (Cumulative Layout Shift) -->
    <div v-else-if="loading" class="product-grid" aria-busy="true" aria-label="Cargando productos...">
      <div v-for="n in 6" :key="'skeleton-' + n" class="skeleton-card">
        <div class="skeleton-image shimmer"></div>
        <div class="skeleton-content">
          <div class="skeleton-sku shimmer"></div>
          <div class="skeleton-title shimmer"></div>
          <div class="skeleton-desc shimmer"></div>
          <div class="skeleton-footer">
            <div class="skeleton-price shimmer"></div>
            <div class="skeleton-btn shimmer"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Estado Vacío: Filtros muy restrictivos -->
    <div v-else-if="filteredProducts.length === 0" class="grid-message empty-message">
      <div class="empty-icon">🔍</div>
      <h3>No se encontraron productos</h3>
      <p>No hay artículos que coincidan con tu término de búsqueda o filtros seleccionados.</p>
      <button 
        class="reset-filters-btn" 
        @click="handleResetFilters"
        aria-label="Limpiar todos los filtros"
      >
        Limpiar Filtros
      </button>
    </div>

    <!-- 3. Estado Nominal: Rejilla Responsiva de Productos -->
    <div v-else class="product-grid">
      <div 
        v-for="product in filteredProducts" 
        :key="product.id"
        class="grid-item"
      >
        <ProductCard :product="product" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-grid-container {
  width: 100%;
}

/* Rejilla Responsiva Principal (CSS Grid) */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.75rem;
  width: 100%;
}

.grid-item {
  display: flex;
}

/* Mensajes Auxiliares (Vacío y Error) */
.grid-message {
  text-align: center;
  padding: 4rem 2rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  max-width: 600px;
  margin: 2rem auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.error-message {
  border-color: hsla(0, 84%, 60%, 0.2);
  background-color: hsla(0, 84%, 60%, 0.02);
}

.empty-icon, .icon {
  font-size: 3.5rem;
  line-height: 1;
}

.empty-message h3 {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--color-text);
  margin: 0.5rem 0 0;
}

.empty-message p {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  max-width: 400px;
  line-height: 1.5;
  margin: 0;
}

/* Botones */
.reset-filters-btn, .retry-button {
  padding: 0.7rem 1.5rem;
  background-color: var(--color-accent);
  color: var(--color-primary);
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.9rem;
  font-family: var(--font-sans);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-fast), background-color var(--transition-fast), box-shadow var(--transition-fast);
}

.reset-filters-btn:hover {
  background-color: var(--color-accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 153, 0, 0.3);
}

.retry-button {
  background-color: var(--color-primary-light);
  color: var(--color-surface);
}

.retry-button:hover {
  background-color: var(--color-primary);
  transform: translateY(-2px);
}

.reset-filters-btn:active, .retry-button:active {
  transform: scale(0.98);
}

/* =========================================================================
   ESTRUCTURA DE SKELETON LOADERS (Mitigación del CLS)
   ========================================================================= */

.skeleton-card {
  display: flex;
  flex-direction: column;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  height: 410px; /* Misma altura de tarjetas nominales */
}

.skeleton-image {
  width: 100%;
  padding-top: 66.67%; /* Relación de aspecto 3:2 exacta */
  background-color: var(--color-background);
}

.skeleton-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 0.65rem;
}

.skeleton-sku {
  width: 35%;
  height: 12px;
  background-color: var(--color-border);
  border-radius: 4px;
}

.skeleton-title {
  width: 85%;
  height: 20px;
  background-color: var(--color-border);
  border-radius: 4px;
  margin-bottom: 0.25rem;
}

.skeleton-desc {
  width: 100%;
  height: 36px;
  background-color: var(--color-border);
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.skeleton-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  width: 100%;
}

.skeleton-price {
  width: 30%;
  height: 24px;
  background-color: var(--color-border);
  border-radius: 4px;
}

.skeleton-btn {
  width: 40%;
  height: 34px;
  background-color: var(--color-border);
  border-radius: 6px;
}

/* Efecto Shimmer (Brillo animado lineal) */
.shimmer {
  background: linear-gradient(
    90deg,
    var(--color-background) 25%,
    var(--color-border) 37%,
    var(--color-background) 63%
  );
  background-size: 400% 100%;
  animation: shimmer-animation 1.4s ease infinite;
}

@keyframes shimmer-animation {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
