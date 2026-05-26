<script setup>
import { storeToRefs } from 'pinia'
import { useProductStore } from '@/store/products'

const emit = defineEmits(['search'])

const productStore = useProductStore()
const { searchQuery } = storeToRefs(productStore)

const handleSearch = () => {
  productStore.setSearchQuery(searchQuery.value)
  emit('search', searchQuery.value)
}

const handleClear = () => {
  searchQuery.value = ''
  productStore.setSearchQuery('')
  emit('search', '')
}
</script>

<template>
  <form class="search-bar" @submit.prevent="handleSearch">
    <div class="search-input-wrapper">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar productos en NebriAmazon..."
        class="search-input"
        aria-label="Buscar productos"
      />
      <button 
        v-if="searchQuery" 
        type="button" 
        class="clear-button" 
        @click="handleClear"
        aria-label="Limpiar búsqueda"
      >
        &times;
      </button>
    </div>
    <button type="submit" class="search-button" aria-label="Ejecutar búsqueda">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        class="search-icon"
      >
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    </button>
  </form>
</template>

<style scoped>
.search-bar {
  display: flex;
  width: 100%;
  max-width: 700px;
  background-color: var(--color-surface);
  border-radius: 6px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-fast), border-color var(--transition-fast);
  border: 2px solid transparent;
}

.search-bar:focus-within {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(255, 153, 0, 0.25);
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  height: 40px;
  padding: 0 2.5rem 0 1rem;
  border: none;
  font-family: var(--font-sans);
  font-size: 0.95rem;
  color: var(--color-text);
  background: transparent;
  outline: none;
}

.search-input::placeholder {
  color: var(--color-text-muted);
}

.clear-button {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: color var(--transition-fast);
}

.clear-button:hover {
  color: var(--color-text);
}

.search-button {
  background-color: var(--color-accent);
  border: none;
  width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.search-button:hover {
  background-color: var(--color-accent-hover);
}

.search-icon {
  width: 18px;
  height: 18px;
  color: var(--color-primary);
}
</style>
