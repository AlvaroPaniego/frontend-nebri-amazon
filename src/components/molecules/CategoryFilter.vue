<script setup>
/**
 * CategoryFilter.vue — Molécula de Filtrado por Categorías
 *
 * Responsabilidad única: renderizar el selector de categorías de forma adaptativa
 * (chips en móvil, lista lateral en escritorio) y delegar toda la lógica de estado
 * al useProductStore. No contiene lógica de negocio propia.
 *
 * Props:
 *   variant: 'chips'   → botonera horizontal con scroll (móvil/tablet)
 *            'sidebar' → lista vertical con viñetas (escritorio)
 *            'auto'    → renderiza ambas; CSS se encarga de ocultar la que no aplica
 */

import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useProductStore } from '@/store/products';

const props = defineProps({
  variant: {
    type: String,
    default: 'auto',
    validator: (v) => ['chips', 'sidebar', 'auto'].includes(v),
  },
});

const productStore = useProductStore();
const { categories, selectedCategory, loading } = storeToRefs(productStore);

// ─── Número de placeholders del skeleton ──────────────────────────────────────
const SKELETON_COUNT = 5;

onMounted(() => {
  productStore.fetchCategories();
});

const handleSelectCategory = (categoryId) => {
  productStore.setSelectedCategory(categoryId);
};
</script>

<template>
  <!-- ═══════════════════════════════════════════════════════════════════════
       VARIANTE CHIPS  ·  visible en móvil / tablet (≤ 900px) o forzada
       ═══════════════════════════════════════════════════════════════════ -->
  <div
    v-if="variant === 'chips' || variant === 'auto'"
    class="cf-chips-wrapper"
    :class="{ 'cf-chips-wrapper--auto': variant === 'auto' }"
    aria-label="Filtro rápido de categorías"
  >
    <!-- Estado de carga: skeleton de chips -->
    <template v-if="loading && categories.length === 0">
      <span
        v-for="n in SKELETON_COUNT"
        :key="'chip-sk-' + n"
        class="cf-chip cf-chip--skeleton"
        aria-hidden="true"
      ></span>
    </template>

    <!-- Estado vacío tras carga -->
    <p
      v-else-if="!loading && categories.length === 0"
      class="cf-empty-text"
      aria-live="polite"
    >
      Filtros temporalmente no disponibles
    </p>

    <!-- Categorías cargadas -->
    <template v-else>
      <button
        class="cf-chip"
        :class="{ 'cf-chip--active': selectedCategory === null }"
        @click="handleSelectCategory(null)"
        aria-label="Mostrar todos los productos"
        :aria-pressed="selectedCategory === null"
      >
        Todos los productos
      </button>
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="cf-chip"
        :class="{ 'cf-chip--active': selectedCategory === cat.id }"
        @click="handleSelectCategory(cat.id)"
        :aria-label="'Filtrar por categoría ' + cat.name"
        :aria-pressed="selectedCategory === cat.id"
      >
        {{ cat.name }}
      </button>
    </template>
  </div>

  <!-- ═══════════════════════════════════════════════════════════════════════
       VARIANTE SIDEBAR  ·  visible en escritorio (> 900px) o forzada
       ═══════════════════════════════════════════════════════════════════ -->
  <nav
    v-if="variant === 'sidebar' || variant === 'auto'"
    class="cf-sidebar"
    :class="{ 'cf-sidebar--auto': variant === 'auto' }"
    aria-label="Filtro lateral de categorías"
  >
    <h2 class="cf-sidebar__title">Categorías</h2>

    <!-- Estado de carga: skeleton de filas -->
    <ul
      v-if="loading && categories.length === 0"
      class="cf-sidebar__list"
      aria-hidden="true"
    >
      <li
        v-for="n in SKELETON_COUNT"
        :key="'sb-sk-' + n"
        class="cf-sidebar__item"
      >
        <span class="cf-sidebar__link cf-sidebar__link--skeleton"></span>
      </li>
    </ul>

    <!-- Estado vacío tras carga -->
    <p
      v-else-if="!loading && categories.length === 0"
      class="cf-empty-text cf-empty-text--sidebar"
      aria-live="polite"
    >
      Filtros temporalmente no disponibles
    </p>

    <!-- Categorías cargadas -->
    <ul v-else class="cf-sidebar__list">
      <li class="cf-sidebar__item">
        <button
          class="cf-sidebar__link"
          :class="{ 'cf-sidebar__link--active': selectedCategory === null }"
          @click="handleSelectCategory(null)"
          aria-label="Mostrar todos los productos"
          :aria-pressed="selectedCategory === null"
        >
          <span class="cf-sidebar__bullet" aria-hidden="true"></span>
          Todos los productos
        </button>
      </li>
      <li
        v-for="cat in categories"
        :key="cat.id"
        class="cf-sidebar__item"
      >
        <button
          class="cf-sidebar__link"
          :class="{ 'cf-sidebar__link--active': selectedCategory === cat.id }"
          @click="handleSelectCategory(cat.id)"
          :aria-label="'Filtrar por categoría ' + cat.name"
          :aria-pressed="selectedCategory === cat.id"
        >
          <span class="cf-sidebar__bullet" aria-hidden="true"></span>
          {{ cat.name }}
        </button>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
/* ─────────────────────────────────────────────────────────────
   ANIMACIÓN SHIMMER  (compartida por chips y sidebar)
   ───────────────────────────────────────────────────────────── */
@keyframes cf-shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position:  400px 0; }
}

.cf-chip--skeleton,
.cf-sidebar__link--skeleton {
  background: linear-gradient(
    90deg,
    var(--color-border)        25%,
    hsl(220, 12%, 94%)         50%,
    var(--color-border)        75%
  );
  background-size: 800px 100%;
  animation: cf-shimmer 1.4s ease-in-out infinite;
  border-color: transparent !important;
  color: transparent !important;
  cursor: default;
  pointer-events: none;
}

/* ─────────────────────────────────────────────────────────────
   VARIANTE CHIPS
   ───────────────────────────────────────────────────────────── */
.cf-chips-wrapper {
  display: flex;
  gap: 0.6rem;
  overflow-x: auto;
  padding: 0.25rem 0.25rem 0.6rem;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.cf-chips-wrapper::-webkit-scrollbar {
  display: none;
}

/* En modo 'auto', ocultar chips en escritorio */
.cf-chips-wrapper--auto {
  display: flex; /* visible por defecto (móvil first) */
}

@media (min-width: 901px) {
  .cf-chips-wrapper--auto {
    display: none;
  }
}

/* ── Chip base ── */
.cf-chip {
  flex-shrink: 0;
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
  transition: border-color var(--transition-fast),
              color       var(--transition-fast),
              background  var(--transition-fast),
              box-shadow  var(--transition-fast);
  outline: none;

  /* Ancho mínimo para el skeleton */
  min-width: 7rem;
  min-height: 2.1rem;
}

.cf-chip:hover {
  border-color: var(--color-accent);
  color: var(--color-accent-hover);
}

.cf-chip--active {
  background-color: var(--color-accent);
  color: var(--color-primary);
  border-color: var(--color-accent);
  box-shadow: 0 4px 12px hsla(36, 100%, 50%, 0.30);
}

.cf-chip:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* ─────────────────────────────────────────────────────────────
   VARIANTE SIDEBAR
   ───────────────────────────────────────────────────────────── */
.cf-sidebar {
  /* el elemento padre (<aside> en CatalogView) controla ancho y padding */
}

/* En modo 'auto', ocultar sidebar en móvil */
.cf-sidebar--auto {
  display: block;
}

@media (max-width: 900px) {
  .cf-sidebar--auto {
    display: none;
  }
}

.cf-sidebar__title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-primary);
  margin: 0 0 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--color-border);
}

.cf-sidebar__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.cf-sidebar__item {
  display: flex;
}

/* ── Botón de enlace lateral ── */
.cf-sidebar__link {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.55rem 0.75rem;
  background: none;
  border: 1px solid transparent;
  border-radius: 6px;
  font-family: var(--font-sans);
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-align: left;
  cursor: pointer;
  transition: background-color var(--transition-fast),
              color            var(--transition-fast),
              border-color     var(--transition-fast);
  outline: none;

  /* Skeleton: alto mínimo */
  min-height: 2.1rem;
  min-width: 100%;
}

.cf-sidebar__link:hover {
  background-color: var(--color-background);
  color: var(--color-text);
}

.cf-sidebar__link:hover .cf-sidebar__bullet {
  background-color: var(--color-accent);
}

.cf-sidebar__link--active {
  background-color: hsla(36, 100%, 50%, 0.08);
  color: var(--color-accent-hover);
  font-weight: 700;
}

.cf-sidebar__link--active .cf-sidebar__bullet {
  background-color: var(--color-accent);
  transform: scale(1.4);
}

.cf-sidebar__link:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* ── Viñeta circular ── */
.cf-sidebar__bullet {
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--color-border);
  margin-right: 0.65rem;
  transition: background-color var(--transition-fast),
              transform        var(--transition-fast);
}

/* ─────────────────────────────────────────────────────────────
   ESTADO VACÍO (empty state)
   ───────────────────────────────────────────────────────────── */
.cf-empty-text {
  font-family: var(--font-sans);
  font-size: 0.8rem;
  font-style: italic;
  color: var(--color-text-muted);
  padding: 0.4rem 0;
  margin: 0;
  white-space: nowrap;
}

.cf-empty-text--sidebar {
  white-space: normal;
  padding: 0.5rem 0;
  line-height: 1.5;
}
</style>
