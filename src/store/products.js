import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as productService from '@/services/productService';

export const useProductStore = defineStore('products', () => {
  // =========================================================================
  // ESTADO (State)
  // =========================================================================
  const products = ref([]);
  const categories = ref([]);
  const searchQuery = ref('');
  const selectedCategory = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Caché indexado para evitar peticiones redundantes a la red
  const cache = ref({
    products: null,
    categories: null,
    productBySku: {}
  });

  // =========================================================================
  // GETTERS (Reactivos)
  // =========================================================================

  /**
   * getFilteredProducts - Combina reactivamente la búsqueda de texto y el
   * filtro por categoría seleccionada para entregar un resultado instantáneo.
   */
  const getFilteredProducts = computed(() => {
    let result = products.value;

    // 1. Filtrado por Categoría Seleccionada
    if (selectedCategory.value !== null && selectedCategory.value !== undefined && selectedCategory.value !== '') {
      result = result.filter(
        p => Number(p.category_id) === Number(selectedCategory.value)
      );
    }

    // 2. Filtrado por Búsqueda (Buscador Avanzado con coincidencia parcial)
    if (searchQuery.value.trim() !== '') {
      const query = searchQuery.value.trim().toLowerCase();
      result = result.filter(p => {
        const nameMatch = p.name?.toLowerCase().includes(query);
        const descMatch = p.description?.toLowerCase().includes(query);
        const skuMatch = p.sku?.toLowerCase().includes(query);
        return nameMatch || descMatch || skuMatch;
      });
    }

    return result;
  });

  // =========================================================================
  // ACCIONES (Actions)
  // =========================================================================

  /**
   * fetchProducts - Carga la lista completa de productos.
   * Consulta primero la caché en memoria para evitar redundancia de red.
   *
   * @param {boolean} force - Si es true, ignora la caché y fuerza la petición REST
   */
  const fetchProducts = async (force = false) => {
    if (cache.value.products && !force) {
      products.value = cache.value.products;
      return products.value;
    }

    loading.value = true;
    error.value = null;
    try {
      const data = await productService.getProducts();
      products.value = data;
      cache.value.products = data;
      return data;
    } catch (err) {
      error.value = err.message || 'Error al recuperar el catálogo de productos.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * fetchCategories - Carga la lista de categorías disponibles para el filtrado.
   * Utiliza la memoria caché local de forma defensiva.
   *
   * @param {boolean} force - Si es true, fuerza la petición de red
   */
  const fetchCategories = async (force = false) => {
    if (cache.value.categories && !force) {
      categories.value = cache.value.categories;
      return categories.value;
    }

    loading.value = true;
    error.value = null;
    try {
      const data = await productService.getCategories();
      categories.value = data;
      cache.value.categories = data;
      return data;
    } catch (err) {
      error.value = err.message || 'Error al recuperar las categorías.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * fetchProductsByCategory - Carga productos filtrados por categoría desde el backend.
   *
   * @param {number|string} categoryId - ID de la categoría
   */
  const fetchProductsByCategory = async (categoryId) => {
    loading.value = true;
    error.value = null;
    try {
      const data = await productService.getProductsByCategory(categoryId);
      products.value = data;
      return data;
    } catch (err) {
      error.value = err.message || 'Error al recuperar productos de la categoría.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * fetchProductBySku - Carga la ficha de un producto específico mediante su SKU.
   * Revisa primero el caché indexado y la colección cargada localmente.
   *
   * @param {string} sku - El SKU único del producto
   * @param {boolean} force - Si es true, ignora el caché e interroga al servicio
   */
  const fetchProductBySku = async (sku, force = false) => {
    if (!sku) {
      throw new Error('El SKU o ID del producto es necesario.');
    }

    // 1. Comprobar si ya existe indexado en el caché específico
    if (cache.value.productBySku[sku] && !force) {
      return cache.value.productBySku[sku];
    }

    // 2. Comprobar si ya está presente en el catálogo cargado en memoria
    const localMatch = products.value.find(
      p => p.sku.toUpperCase() === sku.toUpperCase() || p.id === sku
    );
    if (localMatch && !force) {
      cache.value.productBySku[sku] = localMatch;
      return localMatch;
    }

    loading.value = true;
    error.value = null;
    try {
      const data = await productService.getProductBySku(sku);
      cache.value.productBySku[sku] = data;
      return data;
    } catch (err) {
      error.value = err.message || 'Error al recuperar el detalle del producto.';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * setSearchQuery - Actualiza reactivamente el término de búsqueda
   *
   * @param {string} query - Término de búsqueda
   */
  const setSearchQuery = (query) => {
    searchQuery.value = query || '';
  };

  /**
   * setSelectedCategory - Selecciona la categoría activa de filtrado
   * y obtiene los productos del backend para esa categoría.
   *
   * @param {number|string|null} categoryId - ID de la categoría
   */
  const setSelectedCategory = async (categoryId) => {
    if (categoryId !== null && categoryId !== undefined && categoryId !== '') {
      await fetchProductsByCategory(categoryId);
      selectedCategory.value = categoryId;
    } else {
      await fetchProducts(true);
      selectedCategory.value = null;
    }
  };

  /**
   * resetFilters - Restablece todos los criterios de búsqueda y filtros,
   * y recarga el catálogo completo desde el backend.
   */
  const resetFilters = async () => {
    searchQuery.value = '';
    await fetchProducts(true);
    selectedCategory.value = null;
  };

  /**
   * resetState - Limpia por completo el estado del catálogo y la caché
   * (Muy útil para invocar en el logout y evitar fugas de información)
   */
  const resetState = () => {
    products.value = [];
    categories.value = [];
    searchQuery.value = '';
    selectedCategory.value = null;
    loading.value = false;
    error.value = null;
    cache.value = {
      products: null,
      categories: null,
      productBySku: {}
    };
  };

  return {
    products,
    categories,
    searchQuery,
    selectedCategory,
    loading,
    error,
    cache,
    getFilteredProducts,
    fetchProducts,
    fetchProductsByCategory,
    fetchCategories,
    fetchProductBySku,
    setSearchQuery,
    setSelectedCategory,
    resetFilters,
    resetState
  };
});
