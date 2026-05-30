<script setup>
import { onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useProductStore } from '@/store/products';
import SearchBar from '@/components/molecules/SearchBar.vue';
import CategoryFilter from '@/components/molecules/CategoryFilter.vue';
import ProductGrid from '@/components/organisms/ProductGrid.vue';

const productStore = useProductStore();
const { categories, selectedCategory, searchQuery, loading } = storeToRefs(productStore);

// Contador reactivo basado en el getter del store (filtra por categoría + búsqueda)
const filteredProductsCount = computed(() => productStore.getFilteredProducts.length);

onMounted(() => {
  // CategoryFilter ya lanza fetchCategories en su propio onMounted.
  // Aquí sólo disparamos los productos.
  productStore.fetchProducts();


});

const handleClearAll = () => {
  productStore.resetFilters();
};
</script>

<template>
  <main class="catalog-view" aria-label="Catálogo general de productos de NebriAmazon">

    <!-- ─── Cabecera del Catálogo ─── -->
    <header class="catalog-header">
      <div class="header-container">
        <h1 class="catalog-title">Explorar Catálogo</h1>
        <p class="catalog-subtitle">Descubre las mejores ofertas con envíos rápidos y simulación segura.</p>
      </div>
    </header>

    <!-- ─── Barra de Búsqueda + Chips de Categorías (Móvil / Tablet) ─── -->
    <section class="search-filters-bar" aria-label="Buscador y filtros rápidos">
      <div class="search-wrapper">
        <SearchBar />
      </div>
      <!-- chips visible solo en ≤ 900 px -->
      <CategoryFilter variant="chips" />
    </section>

    <!-- ─── Layout Dos Columnas: Sidebar + Rejilla de Productos ─── -->
    <div class="catalog-layout">

      <!-- Barra Lateral de Categorías (Escritorio ≥ 901 px) -->
      <aside class="catalog-sidebar" aria-label="Filtros del catálogo">
        <div class="sidebar-sticky-panel">
          <!-- sidebar visible solo en > 900 px -->
          <CategoryFilter variant="sidebar" />

          <!-- Panel de Filtros Activos -->
          <div
            v-if="selectedCategory !== null || searchQuery !== ''"
            class="active-filters-panel"
          >
            <h3 class="filters-panel-title">Filtros Activos</h3>
            <div class="active-chips">
              <span v-if="selectedCategory !== null" class="active-filter-badge">
                Categoría: {{ categories.find(c => c.id === selectedCategory)?.name }}
                <button
                  class="remove-filter-btn"
                  @click="productStore.setSelectedCategory(null)"
                  aria-label="Quitar filtro de categoría"
                >&times;</button>
              </span>
              <span v-if="searchQuery !== ''" class="active-filter-badge">
                Búsqueda: "{{ searchQuery }}"
                <button
                  class="remove-filter-btn"
                  @click="productStore.setSearchQuery('')"
                  aria-label="Quitar filtro de búsqueda"
                >&times;</button>
              </span>
            </div>
            <button class="clear-all-btn" @click="handleClearAll">
              Limpiar Todo
            </button>
          </div>
        </div>
      </aside>

      <!-- Área Principal: Contador + Rejilla de Productos -->
      <section class="catalog-main-content" aria-label="Listado de artículos">

        <div class="results-meta-header">
          <h2 class="meta-title">
            <template v-if="selectedCategory !== null">
              {{ categories.find(c => c.id === selectedCategory)?.name || 'Categoría' }}
            </template>
            <template v-else>
              Todos los Productos
            </template>
          </h2>
          <div class="results-counter" aria-live="polite" :aria-busy="loading">
            <span v-if="loading" class="loading-inline-spinner">Cargando...</span>
            <span v-else>
              <strong>{{ filteredProductsCount }}</strong>
              {{ filteredProductsCount === 1 ? 'producto' : 'productos' }}
            </span>
          </div>
        </div>

        <ProductGrid />
      </section>

    </div>
  </main>
</template>

<style scoped>
.catalog-view {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem 1rem 4rem;
}

/* ─── Cabecera ─── */
.catalog-header {
  background-color: var(--color-primary-light);
  border-radius: 12px;
  padding: 2.5rem 2rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow-sm);
  color: var(--color-surface);
  position: relative;
  overflow: hidden;
}

.catalog-header::after {
  content: '';
  position: absolute;
  top: 0; right: 0; bottom: 0;
  width: 40%;
  background: linear-gradient(135deg, transparent, rgba(255, 153, 0, 0.15));
  pointer-events: none;
}

.catalog-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 0.5rem;
  letter-spacing: -0.7px;
}

.catalog-subtitle {
  font-size: 1rem;
  color: var(--color-text-muted);
  opacity: 0.95;
  margin: 0;
  max-width: 600px;
  line-height: 1.5;
}

/* ─── Barra Búsqueda + Chips ─── */
.search-filters-bar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.search-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
}

/* ─── Layout Dos Columnas ─── */
.catalog-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 2rem;
  align-items: start;
}

/* Barra Lateral */
.catalog-sidebar {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.sidebar-sticky-panel {
  position: sticky;
  top: 80px;
}

/* Panel de Filtros Activos */
.active-filters-panel {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filters-panel-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
}

.active-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.active-filter-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.6rem;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.78rem;
  color: var(--color-text);
  font-weight: 600;
}

.remove-filter-btn {
  background: none;
  border: none;
  font-size: 1.05rem;
  color: var(--color-text-muted);
  cursor: pointer;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: color var(--transition-fast);
}

.remove-filter-btn:hover {
  color: var(--color-error);
}

.clear-all-btn {
  background: none;
  border: 1px dashed var(--color-text-muted);
  color: var(--color-text-muted);
  font-family: var(--font-sans);
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color var(--transition-fast),
              border-color     var(--transition-fast),
              color            var(--transition-fast);
}

.clear-all-btn:hover {
  background-color: hsla(0, 84%, 60%, 0.05);
  border-color: var(--color-error);
  color: var(--color-error);
}

/* Área Principal */
.catalog-main-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.results-meta-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.75rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.meta-title {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-primary);
  margin: 0;
}

.results-counter {
  font-size: 0.88rem;
  color: var(--color-text-muted);
}

.results-counter strong {
  color: var(--color-text);
  font-weight: 700;
}

/* ─── Responsividad ─── */
@media (max-width: 900px) {
  .catalog-layout {
    grid-template-columns: 1fr;
  }

  /* El aside queda oculto; CategoryFilter variant="auto"
     ya oculta su bloque sidebar internamente */
  .catalog-sidebar {
    display: none;
  }

  .catalog-header {
    padding: 2rem 1.5rem;
    margin-bottom: 1.5rem;
  }

  .catalog-title {
    font-size: 1.6rem;
  }
}
</style>
