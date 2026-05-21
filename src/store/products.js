import { defineStore } from 'pinia';
import productService from '@/services/productService';

export const useProductStore = defineStore('products', {
  state: () => ({
    products: [],
    selectedProduct: null,
    loading: false,
    filters: {
      category_id: '',
      searchQuery: '',
      minPrice: null,
      maxPrice: null
    }
  }),

  getters: {
    filteredProducts: (state) => {
      return state.products.filter(product => {
        // Filtro por búsqueda
        if (state.filters.searchQuery) {
          const query = state.filters.searchQuery.toLowerCase();
          const matchName = product.name.toLowerCase().includes(query);
          const matchSku = product.sku.toLowerCase().includes(query);
          const matchDesc = product.description?.toLowerCase().includes(query);
          if (!matchName && !matchSku && !matchDesc) return false;
        }

        // Filtro por Categoría
        if (state.filters.category_id && String(product.category_id) !== String(state.filters.category_id)) {
          return false;
        }

        // Filtro por Precio Mínimo
        if (state.filters.minPrice !== null && product.price < state.filters.minPrice) {
          return false;
        }

        // Filtro por Precio Máximo
        if (state.filters.maxPrice !== null && product.price > state.filters.maxPrice) {
          return false;
        }

        return true;
      });
    }
  },

  actions: {
    async fetchProducts() {
      this.loading = true;
      try {
        const products = await productService.getAll();
        this.products = products;
      } finally {
        this.loading = false;
      }
    },

    async fetchProductById(id) {
      this.loading = true;
      try {
        const product = await productService.getById(id);
        this.selectedProduct = product;
        return product;
      } finally {
        this.loading = false;
      }
    },

    async createProduct(productData) {
      this.loading = true;
      try {
        const newProduct = await productService.create(productData);
        this.products.push(newProduct);
        return newProduct;
      } finally {
        this.loading = false;
      }
    },

    async updateProduct(id, productData) {
      this.loading = true;
      try {
        const updatedProduct = await productService.update(id, productData);
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
          this.products[index] = { ...this.products[index], ...updatedProduct };
        }
        if (this.selectedProduct?.id === id) {
          this.selectedProduct = { ...this.selectedProduct, ...updatedProduct };
        }
        return updatedProduct;
      } finally {
        this.loading = false;
      }
    },

    async deleteProduct(id) {
      this.loading = true;
      try {
        await productService.delete(id);
        this.products = this.products.filter(p => p.id !== id);
        if (this.selectedProduct?.id === id) {
          this.selectedProduct = null;
        }
      } finally {
        this.loading = false;
      }
    },

    setSearchQuery(query) {
      this.filters.searchQuery = query;
    },

    setCategoryFilter(categoryId) {
      this.filters.category_id = categoryId;
    },

    clearFilters() {
      this.filters.category_id = '';
      this.filters.searchQuery = '';
      this.filters.minPrice = null;
      this.filters.maxPrice = null;
    }
  }
});
