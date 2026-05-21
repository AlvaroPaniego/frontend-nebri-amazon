<template>
  <div class="catalog-view container">
    <!-- Sidebar de Filtros -->
    <aside class="filters-sidebar">
      <div class="sidebar-header">
        <h3>Filtros de Compra</h3>
        <button @click="clearFilters" class="clear-btn">Limpiar</button>
      </div>
      
      <div class="filter-group">
        <h4>Categorías</h4>
        <div class="category-options">
          <label
            v-for="cat in categories"
            :key="cat.id"
            class="filter-checkbox-label"
          >
            <input
              type="radio"
              name="category"
              :value="cat.id"
              :checked="String(productStore.filters.category_id) === String(cat.id)"
              @change="setCategory(cat.id)"
            />
            {{ cat.name }}
          </label>
        </div>
      </div>
      
      <div class="filter-group">
        <h4>Rango de Precios</h4>
        <div class="price-inputs">
          <input
            type="number"
            placeholder="Min €"
            v-model.number="productStore.filters.minPrice"
            class="price-input"
          />
          <span class="price-separator">-</span>
          <input
            type="number"
            placeholder="Max €"
            v-model.number="productStore.filters.maxPrice"
            class="price-input"
          />
        </div>
      </div>
    </aside>
    
    <!-- Contenido Principal del Catálogo -->
    <main class="catalog-main">
      <div class="catalog-header">
        <h2 class="results-title">
          {{ resultText }}
        </h2>
        <span v-if="productStore.filters.searchQuery" class="search-badge">
          Búsqueda: "{{ productStore.filters.searchQuery }}"
        </span>
      </div>
      
      <!-- Skeletons animados de carga -->
      <div v-if="productStore.loading" class="products-grid">
        <div v-for="n in 6" :key="n" class="skeleton-card">
          <div class="skeleton-img shimmer"></div>
          <div class="skeleton-text shimmer"></div>
          <div class="skeleton-text-half shimmer"></div>
        </div>
      </div>
      
      <!-- Listado de Productos -->
      <template v-else>
        <div v-if="productStore.filteredProducts.length > 0" class="products-grid">
          <ProductCard
            v-for="product in productStore.filteredProducts"
            :key="product.id"
            :product="product"
          />
        </div>
        
        <!-- Estado Vacío -->
        <div v-else class="empty-catalog float-in">
          <span class="empty-icon">🔍</span>
          <h3>No se encontraron productos</h3>
          <p>Prueba a modificar tus criterios de búsqueda o limpia los filtros activos.</p>
          <BaseButton variant="primary" @click="clearFilters">Mostrar Todos los Productos</BaseButton>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useProductStore } from '@/store/products';
import ProductCard from '@/components/molecules/ProductCard.vue';
import BaseButton from '@/components/atoms/BaseButton.vue';

const productStore = useProductStore();

const categories = [
  { id: '', name: 'Todas las Categorías' },
  { id: 1, name: 'Tecnología' },
  { id: 2, name: 'Hogar' },
  { id: 3, name: 'Deportes' },
  { id: 4, name: 'Libros' }
];

const resultText = computed(() => {
  const count = productStore.filteredProducts.length;
  if (count === 0) return '0 resultados';
  if (count === 1) return '1 resultado encontrado';
  return `${count} resultados encontrados`;
});

const setCategory = (id) => {
  productStore.setCategoryFilter(id);
};

const clearFilters = () => {
  productStore.clearFilters();
};

onMounted(async () => {
  await productStore.fetchProducts();

  // Inyección inteligente de productos mockup para que el prototipo esté lleno de vida si no hay backend activo
  if (productStore.products.length === 0) {
    productStore.products = [
      {
        id: 'mock_1',
        name: 'Auriculares Inalámbricos Premium Pro',
        description: 'Cancelación activa de ruido híbrida de nivel superior. Hasta 45 horas de autonomía con el estuche de carga inteligente.',
        price: 129.99,
        stock: 12,
        sku: 'TEC-AUR-092',
        category_id: 1,
        image_urls: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500']
      },
      {
        id: 'mock_2',
        name: 'Reloj Inteligente FitVibe X',
        description: 'Pantalla AMOLED retina con sensor de pulso cardíaco, SpO2 y monitorización de sueño 24/7. Sumergible a 50m.',
        price: 89.95,
        stock: 3,
        sku: 'TEC-WAT-113',
        category_id: 1,
        image_urls: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500']
      },
      {
        id: 'mock_3',
        name: 'Cafetera de Goteo Automática Elite',
        description: 'Programable con jarra de cristal térmico. Depósito integrado de 1.5L. Panel digital táctil y molinillo cerámico.',
        price: 74.50,
        stock: 25,
        sku: 'HOG-CAF-004',
        category_id: 2,
        image_urls: ['https://images.unsplash.com/photo-1517256064527-09c53b2d0bc6?w=500']
      },
      {
        id: 'mock_4',
        name: 'Estera de Yoga Antideslizante EcoPro',
        description: 'Material TPE ecológico de doble cara con guías de alineación corporal. Espesor ultra confortable de 6mm.',
        price: 32.00,
        stock: 0,
        sku: 'DEP-MAT-821',
        category_id: 3,
        image_urls: ['https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=500']
      },
      {
        id: 'mock_5',
        name: 'El Código Limpio (Clean Code) - R. C. Martin',
        description: 'El manual maestro fundamental que encarna las mejores prácticas profesionales de programación limpia del tío Bob.',
        price: 42.10,
        stock: 8,
        sku: 'LIB-BOB-999',
        category_id: 4,
        image_urls: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500']
      },
      {
        id: 'mock_6',
        name: 'Altavoz Inteligente VoiceHome Pro',
        description: 'Calidad de audio premium Hi-Fi. Control inteligente por voz integrado mediante conexión IoT a todo tu hogar.',
        price: 115.00,
        stock: 6,
        sku: 'TEC-ALT-402',
        category_id: 1,
        image_urls: ['https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500']
      }
    ];
  }
});
</script>

<style scoped>
.catalog-view {
  display: flex;
  padding: 30px 20px;
  gap: 30px;
  min-height: calc(100vh - 70px - 60px);
}

.filters-sidebar {
  width: 260px;
  flex-shrink: 0;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 20px;
  height: fit-content;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 12px;
}

.sidebar-header h3 {
  font-family: var(--font-title);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-primary);
}

.clear-btn {
  font-size: 0.8rem;
  color: var(--color-accent);
  font-weight: 600;
  transition: color var(--transition-fast);
}

.clear-btn:hover {
  color: var(--color-accent-hover);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-group h4 {
  font-family: var(--font-title);
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
}

.category-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--color-text);
  cursor: pointer;
  user-select: none;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-input {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  outline: none;
  background-color: var(--color-background);
  transition: border var(--transition-fast);
}

.price-input:focus {
  border-color: var(--color-accent);
}

.price-separator {
  color: var(--color-text-muted);
}

.catalog-main {
  flex-grow: 1;
}

.catalog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.results-title {
  font-family: var(--font-title);
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-primary);
}

.search-badge {
  background-color: var(--color-primary-light);
  color: var(--color-surface);
  font-size: 0.8rem;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-weight: 500;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 24px;
}

/* Skeleton Loading styles */
.skeleton-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 320px;
}

.skeleton-img {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
}

.skeleton-text {
  height: 16px;
  border-radius: 4px;
  width: 100%;
}

.skeleton-text-half {
  height: 16px;
  border-radius: 4px;
  width: 60%;
}

.empty-catalog {
  text-align: center;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 60px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-sm);
}

.empty-icon {
  font-size: 4rem;
}

.empty-catalog h3 {
  font-family: var(--font-title);
  font-size: 1.4rem;
  color: var(--color-primary);
}

.empty-catalog p {
  color: var(--color-text-muted);
  max-width: 400px;
  font-size: 0.95rem;
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .catalog-view {
    flex-direction: column;
  }
  
  .filters-sidebar {
    width: 100%;
  }
}
</style>
