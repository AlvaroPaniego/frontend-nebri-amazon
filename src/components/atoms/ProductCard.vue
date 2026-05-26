<script setup>
import { computed } from 'vue';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

// Resuelve la primera URL de imagen del producto o entrega un placeholder premium
const productImage = computed(() => {
  return props.product?.image_urls?.[0] ?? `https://placehold.co/300x200/131921/FF9900?text=${encodeURIComponent(props.product?.name?.[0] ?? '?')}`;
});

// Formatea el precio con dos decimales en euros
const formattedPrice = computed(() => {
  const price = parseFloat(props.product?.price);
  return isNaN(price) ? '0,00 €' : `${price.toFixed(2).replace('.', ',')} €`;
});

// Comprueba la disponibilidad en stock
const isAvailable = computed(() => {
  return (props.product?.stock ?? 0) > 0;
});
</script>

<template>
  <article class="product-card" :aria-label="product.name">
    <!-- Contenedor de Imagen con Efecto Zoom Hover -->
    <div class="card-image-wrapper">
      <img
        :src="productImage"
        :alt="product.name"
        class="card-image"
        loading="lazy"
      />
      <!-- Badge de disponibilidad en stock -->
      <span 
        class="stock-badge" 
        :class="{ 'in-stock': isAvailable, 'out-of-stock': !isAvailable }"
      >
        {{ isAvailable ? 'En Stock' : 'Agotado' }}
      </span>
    </div>

    <!-- Contenido Textual de la Tarjeta -->
    <div class="card-content">
      <span class="product-sku" aria-label="Código SKU del producto">
        SKU: {{ product.sku }}
      </span>
      <h3 class="product-title" :title="product.name">
        {{ product.name }}
      </h3>
      <p class="product-description">
        {{ product.description }}
      </p>

      <!-- Fila de Precio y Acción -->
      <div class="card-footer">
        <span class="product-price" aria-label="Precio del producto">
          {{ formattedPrice }}
        </span>

        <!-- Botón accesible de detalles -->
        <router-link
          :to="'/product/' + product.sku"
          class="details-button"
          :aria-label="'Ver detalles de ' + product.name"
        >
          Ver Detalles
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="arrow-icon"
            aria-hidden="true"
          >
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </router-link>
      </div>
    </div>
  </article>
</template>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal), border-color var(--transition-normal);
  height: 100%;
}

/* Hover general de la tarjeta */
.product-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: rgba(255, 153, 0, 0.4);
}

/* Contenedor de la Imagen */
.card-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 66.67%; /* Relación de aspecto 3:2 */
  overflow: hidden;
  background-color: var(--color-background);
}

.card-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Zoom progresivo y elegante al pasar el ratón */
.product-card:hover .card-image {
  transform: scale(1.06);
}

/* Badges de Stock */
.stock-badge {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.2px;
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(4px);
}

.stock-badge.in-stock {
  background-color: hsla(142, 70%, 45%, 0.15);
  color: var(--color-success);
  border: 1px solid hsla(142, 70%, 45%, 0.3);
}

.stock-badge.out-of-stock {
  background-color: hsla(0, 84%, 60%, 0.15);
  color: var(--color-error);
  border: 1px solid hsla(0, 84%, 60%, 0.3);
}

/* Contenido de la Tarjeta */
.card-content {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.product-sku {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-weight: 600;
  margin-bottom: 0.4rem;
}

.product-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 0.5rem;
  line-height: 1.4;
  /* Truncamiento a 2 líneas */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.8rem;
}

.product-description {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  margin-bottom: 1.25rem;
  line-height: 1.5;
  /* Truncamiento a 2 líneas */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.5rem;
}

/* Pie de Tarjeta */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  gap: 0.5rem;
}

.product-price {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-primary);
  letter-spacing: -0.3px;
}

/* Botón de Detalles Premium */
.details-button {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.55rem 0.9rem;
  background-color: var(--color-primary-light);
  color: var(--color-surface);
  font-weight: 700;
  font-size: 0.8rem;
  border-radius: 6px;
  text-decoration: none;
  transition: background-color var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
  outline: none;
  border: 1.5px solid transparent;
}

.details-button:hover {
  background-color: var(--color-accent);
  color: var(--color-primary);
  box-shadow: 0 4px 10px rgba(255, 153, 0, 0.2);
}

.details-button:active {
  transform: scale(0.97);
}

/* Foco accesible de teclado */
.details-button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  background-color: var(--color-accent);
  color: var(--color-primary);
}

.arrow-icon {
  width: 14px;
  height: 14px;
  transition: transform var(--transition-fast);
}

.details-button:hover .arrow-icon,
.details-button:focus-visible .arrow-icon {
  transform: translateX(3px);
}
</style>
