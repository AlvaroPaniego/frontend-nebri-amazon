<template>
  <div class="detail-view container">
    <!-- Botón Volver -->
    <button @click="goBack" class="back-btn">← Volver al catálogo</button>

    <!-- Estado de Carga -->
    <div v-if="loading" class="detail-skeleton">
      <div class="skeleton-img-lg shimmer"></div>
      <div class="skeleton-info shimmer"></div>
    </div>

    <!-- Contenido del Producto -->
    <template v-else-if="product">
      <div class="product-detail-grid">
        <!-- Columna Izquierda: Galería de Imágenes -->
        <div class="gallery-column">
          <img
            :src="product.image_urls?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'"
            :alt="product.name"
            class="main-image"
          />
        </div>

        <!-- Columna Derecha: Información del Producto -->
        <div class="info-column">
          <span class="product-sku">SKU: {{ product.sku }}</span>
          <h1 class="product-title">{{ product.name }}</h1>
          
          <div class="rating-row">
            <BaseRating :value="4.5" />
            <span class="reviews-count">| 14 valoraciones de clientes</span>
          </div>

          <div class="price-box">
            <span class="price-value">{{ formatPrice(product.price) }}</span>
            <span class="tax-info">Incluye IVA (21%)</span>
          </div>

          <div class="divider"></div>

          <p class="product-description">{{ product.description }}</p>

          <div class="divider"></div>

          <!-- Bloque de Compra / Cesta -->
          <div class="purchase-box">
            <div class="stock-row">
              <span class="label">Disponibilidad:</span>
              <span :class="['stock-badge', stockClass]">{{ stockLabel }}</span>
            </div>

            <!-- Selector de Cantidad (Solo si hay stock) -->
            <div v-if="product.stock > 0" class="qty-row">
              <span class="label">Cantidad:</span>
              <select v-model.number="selectedQty" class="qty-select">
                <option v-for="n in Math.min(product.stock, 10)" :key="n" :value="n">
                  {{ n }}
                </option>
              </select>
            </div>

            <!-- Botones de Acción -->
            <div class="actions-row">
              <BaseButton
                variant="primary"
                :disabled="product.stock === 0 || cartLoading"
                :loading="cartLoading"
                @click="addToCart"
                class="add-to-cart-btn"
              >
                {{ product.stock === 0 ? 'Sin existencias' : 'Añadir a la Cesta' }}
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Estado de Error / No Encontrado -->
    <div v-else class="not-found-state float-in">
      <span class="error-icon">⚠️</span>
      <h3>Producto no encontrado</h3>
      <p>El producto solicitado no existe o ha sido descatalogado permanentemente.</p>
      <BaseButton variant="secondary" @click="goBack">Volver al catálogo</BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductStore } from '@/store/products';
import { useCartStore } from '@/store/cart';
import BaseRating from '@/components/atoms/BaseRating.vue';
import BaseButton from '@/components/atoms/BaseButton.vue';

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const cartStore = useCartStore();

const product = ref(null);
const loading = ref(true);
const cartLoading = ref(false);
const selectedQty = ref(1);

const stockLabel = computed(() => {
  if (!product.value) return '';
  if (product.value.stock === 0) return 'Agotado temporalmente';
  if (product.value.stock <= 5) return `¡Últimas ${product.value.stock} unidades en stock!`;
  return 'En stock y listo para enviar';
});

const stockClass = computed(() => {
  if (!product.value) return '';
  if (product.value.stock === 0) return 'stock-out';
  if (product.value.stock <= 5) return 'stock-low';
  return 'stock-ok';
});

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);
};

const goBack = () => {
  router.push({ name: 'Catalog' });
};

const addToCart = async () => {
  if (!product.value) return;
  cartLoading.value = true;
  try {
    await cartStore.addItem(product.value, selectedQty.value);
    // Notificación sutil (puedes reemplazar por un Toast en producción)
    alert(`¡Se han añadido ${selectedQty.value} unidades de "${product.value.name}" a tu cesta!`);
  } catch (error) {
    alert(error.message);
  } finally {
    cartLoading.value = false;
  }
};

onMounted(async () => {
  loading.value = true;
  const productId = route.params.id;
  try {
    // Si la lista de productos está vacía (por ej., al F5), forzamos carga
    if (productStore.products.length === 0) {
      await productStore.fetchProducts();
    }
    
    let found = productStore.products.find(p => String(p.id) === String(productId));
    
    // Fallback Mockup si el usuario entra directo por URL a un mock
    if (!found) {
      const mocks = [
        {
          id: 'mock_1',
          name: 'Auriculares Inalámbricos Premium Pro',
          description: 'Cancelación activa de ruido híbrida de nivel superior. Hasta 45 horas de autonomía con el estuche de carga inteligente.',
          price: 129.99,
          stock: 12,
          sku: 'TEC-AUR-092',
          category_id: 1,
          image_urls: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800']
        },
        {
          id: 'mock_2',
          name: 'Reloj Inteligente FitVibe X',
          description: 'Pantalla AMOLED retina con sensor de pulso cardíaco, SpO2 y monitorización de sueño 24/7. Sumergible a 50m.',
          price: 89.95,
          stock: 3,
          sku: 'TEC-WAT-113',
          category_id: 1,
          image_urls: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800']
        },
        {
          id: 'mock_3',
          name: 'Cafetera de Goteo Automática Elite',
          description: 'Programable con jarra de cristal térmico. Depósito integrado de 1.5L. Panel digital táctil y molinillo cerámico.',
          price: 74.50,
          stock: 25,
          sku: 'HOG-CAF-004',
          category_id: 2,
          image_urls: ['https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?w=800']
        },
        {
          id: 'mock_4',
          name: 'Estera de Yoga Antideslizante EcoPro',
          description: 'Material TPE ecológico de doble cara con guías de alineación corporal. Espesor ultra confortable de 6mm.',
          price: 32.00,
          stock: 0,
          sku: 'DEP-MAT-821',
          category_id: 3,
          image_urls: ['https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800']
        },
        {
          id: 'mock_5',
          name: 'El Código Limpio (Clean Code) - R. C. Martin',
          description: 'El manual maestro fundamental que encarna las mejores prácticas profesionales de programación limpia del tío Bob.',
          price: 42.10,
          stock: 8,
          sku: 'LIB-BOB-999',
          category_id: 4,
          image_urls: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800']
        },
        {
          id: 'mock_6',
          name: 'Altavoz Inteligente VoiceHome Pro',
          description: 'Calidad de audio premium Hi-Fi. Control inteligente por voz integrado mediante conexión IoT a todo tu hogar.',
          price: 115.00,
          stock: 6,
          sku: 'TEC-ALT-402',
          category_id: 1,
          image_urls: ['https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800']
        }
      ];
      found = mocks.find(p => String(p.id) === String(productId));
    }
    
    product.value = found || null;
  } catch (error) {
    console.error('Error al recuperar detalles:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.detail-view {
  padding: 30px 20px 60px;
}

.back-btn {
  font-family: var(--font-title);
  font-size: 0.9rem;
  color: var(--color-primary);
  font-weight: 600;
  margin-bottom: 24px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: color var(--transition-fast);
}

.back-btn:hover {
  color: var(--color-accent);
}

.product-detail-grid {
  display: grid;
  grid-template-columns: minmax(300px, 1.2fr) minmax(300px, 1.8fr);
  gap: 40px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 40px;
  box-shadow: var(--shadow-sm);
}

.gallery-column {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.main-image:hover {
  transform: scale(1.03);
}

.info-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.product-sku {
  font-family: var(--font-title);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.product-title {
  font-family: var(--font-title);
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--color-primary);
  line-height: 1.1;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reviews-count {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.price-box {
  background-color: var(--color-background);
  padding: 16px 24px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: baseline;
  gap: 12px;
  width: fit-content;
  border: 1px solid var(--color-border);
}

.price-value {
  font-family: var(--font-title);
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-primary);
}

.tax-info {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.divider {
  height: 1px;
  background-color: var(--color-border);
  width: 100%;
}

.product-description {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--color-text);
}

.purchase-box {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  width: 100%;
  max-width: 450px;
}

.stock-row, .qty-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  font-family: var(--font-title);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
}

.stock-badge {
  font-weight: 700;
  font-size: 0.9rem;
}

.stock-ok { color: var(--color-success); }
.stock-low { color: var(--color-warning); }
.stock-out { color: var(--color-error); }

.qty-select {
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  outline: none;
  background-color: var(--color-background);
  font-weight: 600;
  cursor: pointer;
}

.qty-select:focus {
  border-color: var(--color-accent);
}

.actions-row {
  margin-top: 8px;
}

.add-to-cart-btn {
  width: 100%;
  padding: 12px !important;
  font-size: 1rem !important;
}

/* Detail Skeletons */
.detail-skeleton {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 40px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 40px;
}

.skeleton-img-lg {
  aspect-ratio: 1;
  border-radius: var(--radius-md);
}

.skeleton-info {
  height: 350px;
  border-radius: var(--radius-md);
}

.not-found-state {
  text-align: center;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 80px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-sm);
  max-width: 600px;
  margin: 0 auto;
}

.error-icon {
  font-size: 4rem;
}

.not-found-state h3 {
  font-family: var(--font-title);
  font-size: 1.40rem;
  color: var(--color-error);
}

.not-found-state p {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .product-detail-grid, .detail-skeleton {
    grid-template-columns: 1fr;
  }
  
  .product-title {
    font-size: 1.8rem;
  }
}
</style>
