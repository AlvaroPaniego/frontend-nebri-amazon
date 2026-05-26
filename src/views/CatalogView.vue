<script setup>
import { onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useProductStore } from '@/store/products';
import SearchBar from '@/components/molecules/SearchBar.vue';
import ProductGrid from '@/components/organisms/ProductGrid.vue';

const productStore = useProductStore();
const { categories, selectedCategory, searchQuery, loading } = storeToRefs(productStore);

// Obtiene los productos filtrados para calcular el conteo reactivamente
const filteredProductsCount = computed(() => productStore.getFilteredProducts.length);

// Al montar la vista, disparamos la precarga de productos y categorías (aprovechando caché)
onMounted(() => {
  productStore.fetchProducts();
  productStore.fetchCategories();
});

// Cambia la categoría activa y actualiza reactivamente el catálogo
const selectCategory = (categoryId) => {
  productStore.setSelectedCategory(categoryId);
};

// Limpia todos los filtros (búsqueda y categorías)
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

    <!-- ─── Contenedor de Búsqueda y Filtros Rápidos (Móvil/Tablet) ─── -->
    <section class="search-filters-bar" aria-label="Buscador y filtros">
      <div class="search-wrapper">
        <!-- Reutilizamos SearchBar sincronizado con el store -->
        <SearchBar />
      </div>

      <!-- Chips de categorías con scroll horizontal para diseño adaptado a móviles -->
      <div class="mobile-categories-chips" aria-label="Filtro rápido de categorías">
        <button
          class="category-chip"
          :class="{ 'active': selectedCategory === null }"
          @click="selectCategory(null)"
          aria-label="Mostrar todas las categorías"
        >
          Todos los productos
        </button>
        <button
          v-for="category in categories"
          :key="category.id"
          class="category-chip"
          :class="{ 'active': selectedCategory === category.id }"
          @click="selectCategory(category.id)"
          :aria-label="'Filtrar por ' + category.name"
        >
          {{ category.name }}
        </button>
      </div>
    </section>

    <!-- ─── Contenedor de Layout Dos Columnas (Sidebar + Rejilla) ─── -->
    <div class="catalog-layout">
      
      <!-- 1. Barra Lateral de Categorías (Visible en Escritorio) -->
      <aside class="catalog-sidebar" aria-label="Filtros del catálogo">
        <div class="sidebar-sticky-panel">
          <h2 class="sidebar-title">Categorías</h2>
          <ul class="categories-list">
            <li>
              <button
                class="category-link"
                :class="{ 'active': selectedCategory === null }"
                @click="selectCategory(null)"
                aria-label="Mostrar todas las categorías"
              >
                <span class="bullet"></span>
                Todos los productos
              </button>
            </li>
            <li v-for="category in categories" :key="category.id">
              <button
                class="category-link"
                :class="{ 'active': selectedCategory === category.id }"
                @click="selectCategory(category.id)"
                :aria-label="'Filtrar por ' + category.name"
              >
                <span class="bullet"></span>
                {{ category.name }}
              </button>
            </li>
          </ul>

          <!-- Resumen de Filtros Activos -->
          <div v-if="selectedCategory !== null || searchQuery !== ''" class="active-filters-panel">
            <h3 class="filters-panel-title">Filtros Activos</h3>
            <div class="active-chips">
              <span v-if="selectedCategory !== null" class="active-filter-badge">
                Categoría: {{ categories.find(c => c.id === selectedCategory)?.name }}
                <button class="remove-filter-btn" @click="selectCategory(null)" aria-label="Quitar filtro de categoría">&times;</button>
              </span>
              <span v-if="searchQuery !== ''" class="active-filter-badge">
                Búsqueda: "{{ searchQuery }}"
                <button class="remove-filter-btn" @click="productStore.setSearchQuery('')" aria-label="Quitar filtro de búsqueda">&times;</button>
              </span>
            </div>
            <button class="clear-all-btn" @click="handleClearAll">
              Limpiar Todo
            </button>
          </div>
        </div>
      </aside>

      <!-- 2. Área Principal del Catálogo (Contador Accesible + Rejilla) -->
      <section class="catalog-main-content" aria-label="Listado de artículos">
        
        <!-- Encabezado del Listado con Anuncio de Voz (aria-live="polite") -->
        <div class="results-meta-header">
          <h2 class="meta-title">Nuestros Artículos</h2>
          
          <div 
            class="results-counter" 
            aria-live="polite" 
            :aria-busy="loading"
          >
            <span v-if="loading" class="loading-inline-spinner">Cargando...</span>
            <span v-else>
              Mostrando <strong>{{ filteredProductsCount }}</strong> 
              {{ filteredProductsCount === 1 ? 'producto' : 'productos' }} 
              disponibles.
            </span>
          </div>
        </div>

        <!-- Grid Organism -->
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
  top: 0;
  right: 0;
  bottom: 0;
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

/* ─── Barra de Búsqueda y Categorías Móviles ─── */
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

.mobile-categories-chips {
  display: flex;
  gap: 0.6rem;
  overflow-x: auto;
  padding: 0.25rem 0.25rem 0.6rem;
  scrollbar-width: none; /* Oculta scroll en Firefox */
  -webkit-overflow-scrolling: touch;
}

.mobile-categories-chips::-webkit-scrollbar {
  display: none; /* Oculta scroll en Chrome/Safari */
}

.category-chip {
  padding: 0.55rem 1.1rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  font-family: var(--font-sans);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
  outline: none;
}

.category-chip:hover {
  border-color: var(--color-accent);
  color: var(--color-accent-hover);
}

.category-chip.active {
  background-color: var(--color-accent);
  color: var(--color-primary);
  border-color: var(--color-accent);
  box-shadow: 0 4px 10px rgba(255, 153, 0, 0.25);
}

.category-chip:focus-visible {
  outline: 2px solid var(--color-accent);
}

/* ─── Layout de Dos Columnas (Sidebar + Rejilla) ─── */
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
  top: 80px; /* Compensa la cabecera */
}

.sidebar-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-primary);
  margin: 0 0 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--color-border);
}

.categories-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.category-link {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.6rem 0.8rem;
  background: none;
  border: 1px solid transparent;
  border-radius: 6px;
  font-family: var(--font-sans);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-align: left;
  cursor: pointer;
  transition: all var(--transition-fast);
  outline: none;
}

.category-link .bullet {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--color-border);
  margin-right: 0.65rem;
  transition: all var(--transition-fast);
}

.category-link:hover {
  background-color: var(--color-background);
  color: var(--color-text);
}

.category-link:hover .bullet {
  background-color: var(--color-accent);
}

.category-link.active {
  background-color: hsla(36, 100%, 50%, 0.08);
  color: var(--color-accent-hover);
  font-weight: 700;
}

.category-link.active .bullet {
  background-color: var(--color-accent);
  transform: scale(1.4);
}

.category-link:focus-visible {
  outline: 2px solid var(--color-accent);
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
  transition: all var(--transition-fast);
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

/* Responsividad */
@media (max-width: 900px) {
  .catalog-layout {
    grid-template-columns: 1fr;
  }

  .catalog-sidebar {
    display: none; /* Se oculta por completo en móviles porque usamos chips */
  }

  .catalog-header {
    padding: 2rem 1.5rem;
    margin-bottom: 1.5rem;
  }

  .catalog-title {
    font-size: 1.6rem;
  }
}

@media (min-width: 901px) {
  /* Ocultamos los chips en escritorio */
  .mobile-categories-chips {
    display: none;
  }
}
</style>
