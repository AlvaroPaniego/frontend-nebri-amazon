<template>
  <div class="product-card float-in">
    <div class="image-wrapper" @click="goToDetail">
      <!-- Muestra imagen real o un placeholder si no hay urls -->
      <img
        :src="product.image_urls?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'"
        :alt="product.name"
        class="product-image"
        loading="lazy"
      />
      <div v-if="product.stock === 0" class="out-of-stock-badge">Agotado</div>
    </div>
    
    <div class="product-info">
      <div class="meta-row">
        <span class="product-sku">{{ product.sku }}</span>
        <span :class="['stock-status', stockClass]">{{ stockLabel }}</span>
      </div>
      
      <h3 class="product-name" @click="goToDetail">{{ product.name }}</h3>
      
      <BaseRating :value="4.5" :show-value="false" class="rating" />
      
      <div class="footer-row">
        <span class="product-price">{{ formatPrice(product.price) }}</span>
        <BaseButton
          variant="primary"
          :disabled="product.stock === 0 || loading"
          :loading="loading"
          @click="addToCart"
          class="add-button"
        >
          Añadir
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/store/cart';
import BaseRating from '../atoms/BaseRating.vue';
import BaseButton from '../atoms/BaseButton.vue';

const props = defineProps({
  product: {
    type: Object,
    required: true,
  }
});

const router = useRouter();
const cartStore = useCartStore();
const loading = ref(false);

const stockLabel = computed(() => {
  if (props.product.stock === 0) return 'Sin stock';
  if (props.product.stock <= 5) return `¡Últimas ${props.product.stock} ud!`;
  return 'En stock';
});

const stockClass = computed(() => {
  if (props.product.stock === 0) return 'status-out';
  if (props.product.stock <= 5) return 'status-low';
  return 'status-ok';
});

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);
};

const goToDetail = () => {
  router.push({ name: 'ProductDetail', params: { id: props.product.id } });
};

const addToCart = async () => {
  loading.value = true;
  try {
    await cartStore.addItem(props.product, 1);
  } catch (error) {
    alert(error.message);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.product-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all var(--transition-normal);
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-accent);
}

.image-wrapper {
  position: relative;
  aspect-ratio: 1;
  background-color: var(--color-background);
  cursor: pointer;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.out-of-stock-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background-color: var(--color-error);
  color: var(--color-surface);
  font-family: var(--font-title);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
}

.product-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 8px;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
}

.product-sku {
  color: var(--color-text-muted);
  font-family: var(--font-title);
  font-weight: 500;
}

.stock-status {
  font-weight: 600;
  border-radius: 4px;
}

.status-ok { color: var(--color-success); }
.status-low { color: var(--color-warning); }
.status-out { color: var(--color-error); }

.product-name {
  font-family: var(--font-title);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 2.4rem;
  line-height: 1.2rem;
  transition: color var(--transition-fast);
}

.product-name:hover {
  color: var(--color-accent);
}

.rating {
  margin: 2px 0;
}

.footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 8px;
}

.product-price {
  font-family: var(--font-title);
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--color-primary);
}

.add-button {
  min-height: 36px !important;
  padding: 6px 14px !important;
  font-size: 0.85rem !important;
}
</style>
