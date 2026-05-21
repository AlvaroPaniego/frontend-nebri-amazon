<template>
  <div class="cart-item float-in">
    <img
      :src="item.product.image_urls?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'"
      :alt="item.product.name"
      class="item-image"
    />
    
    <div class="item-details">
      <div class="header-row">
        <h4 class="item-name">{{ item.product.name }}</h4>
        <span class="item-price-unit">{{ formatPrice(item.product.price) }} / ud</span>
      </div>
      <span class="item-sku">SKU: {{ item.product.sku }}</span>
      
      <div class="actions-row">
        <div class="quantity-controller">
          <button
            class="qty-btn"
            :disabled="item.quantity <= 1 || loading"
            @click="updateQty(item.quantity - 1)"
          >
            -
          </button>
          <span class="qty-val">{{ item.quantity }}</span>
          <button
            class="qty-btn"
            :disabled="loading"
            @click="updateQty(item.quantity + 1)"
          >
            +
          </button>
        </div>
        
        <button class="remove-btn" :disabled="loading" @click="removeItem">
          Eliminar
        </button>
        
        <span class="item-total-price">{{ formatPrice(item.product.price * item.quantity) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useCartStore } from '@/store/cart';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  }
});

const cartStore = useCartStore();
const loading = ref(false);

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);
};

const updateQty = async (newQty) => {
  loading.value = true;
  try {
    await cartStore.updateItemQuantity(props.item.id, newQty);
  } catch (error) {
    alert(error.message);
  } finally {
    loading.value = false;
  }
};

const removeItem = async () => {
  loading.value = true;
  try {
    await cartStore.removeItem(props.item.id);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.cart-item {
  display: flex;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px;
  gap: 16px;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
}

.cart-item:hover {
  border-color: var(--color-accent);
  box-shadow: var(--shadow-md);
}

.item-image {
  width: 90px;
  height: 90px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  background-color: var(--color-background);
}

.item-details {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-between;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.item-name {
  font-family: var(--font-title);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
}

.item-price-unit {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.item-sku {
  font-family: var(--font-title);
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: 4px;
}

.actions-row {
  display: flex;
  align-items: center;
  margin-top: 12px;
  gap: 16px;
}

.quantity-controller {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-background);
  overflow: hidden;
  height: 32px;
}

.qty-btn {
  width: 32px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  background-color: var(--color-surface);
  transition: background var(--transition-fast);
}

.qty-btn:hover:not(:disabled) {
  background-color: var(--color-border);
}

.qty-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.qty-val {
  padding: 0 12px;
  font-weight: 600;
  font-size: 0.9rem;
}

.remove-btn {
  font-size: 0.8rem;
  color: var(--color-error);
  font-weight: 600;
  transition: color var(--transition-fast);
}

.remove-btn:hover:not(:disabled) {
  color: hsl(0, 84%, 45%);
}

.remove-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.item-total-price {
  margin-left: auto;
  font-family: var(--font-title);
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-primary);
}

@media (max-width: 576px) {
  .cart-item {
    flex-direction: column;
  }
  
  .item-image {
    width: 100%;
    height: 150px;
  }
  
  .actions-row {
    flex-wrap: wrap;
  }
  
  .item-total-price {
    width: 100%;
    text-align: right;
    margin-top: 8px;
  }
}
</style>
