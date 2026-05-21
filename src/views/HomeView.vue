<template>
  <div class="home-view">
    <!-- Hero Banner Premium -->
    <header class="hero-banner">
      <div class="hero-content container">
        <h1 class="hero-title float-in">🌌 Explora la tienda del futuro con NebriAmazon</h1>
        <p class="hero-subtitle float-in">Productos premium seleccionados a mano con transacciones rápidas y envío express a toda España.</p>
        <router-link :to="{ name: 'Catalog' }">
          <BaseButton variant="primary" class="hero-btn">Comenzar a Comprar</BaseButton>
        </router-link>
      </div>
    </header>
    
    <!-- Categorías Destacadas -->
    <section class="categories-section container">
      <h2 class="section-title">Categorías Populares</h2>
      <div class="categories-grid">
        <div
          v-for="cat in mockCategories"
          :key="cat.id"
          class="category-card"
          @click="selectCategory(cat.id)"
        >
          <div class="category-icon">{{ cat.icon }}</div>
          <h3 class="category-name">{{ cat.name }}</h3>
        </div>
      </div>
    </section>

    <!-- Banner Informativo -->
    <section class="info-section container">
      <div class="info-card">
        <h3>⚡ Envío Express en 24h</h3>
        <p>Recibe tus productos directamente en la puerta de tu casa al día siguiente.</p>
      </div>
      <div class="info-card">
        <h3>🛡️ Garantía Absoluta</h3>
        <p>Transacciones protegidas con bloqueo pesimista contra overselling y pasarela segura.</p>
      </div>
      <div class="info-card">
        <h3>🤖 Soporte por IA</h3>
        <p>Asistente virtual integrado de forma pasiva para guiarte en cada compra.</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useProductStore } from '@/store/products';
import BaseButton from '@/components/atoms/BaseButton.vue';

const router = useRouter();
const productStore = useProductStore();

const mockCategories = [
  { id: 1, name: 'Tecnología', icon: '💻' },
  { id: 2, name: 'Hogar', icon: '🏠' },
  { id: 3, name: 'Deportes', icon: '⚽' },
  { id: 4, name: 'Libros', icon: '📚' }
];

const selectCategory = (id) => {
  productStore.clearFilters();
  productStore.setCategoryFilter(id);
  router.push({ name: 'Catalog' });
};
</script>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  gap: 48px;
  padding-bottom: 60px;
}

.hero-banner {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  background-size: cover;
  padding: 80px 0;
  text-align: center;
  color: var(--color-surface);
  position: relative;
  overflow: hidden;
}

.hero-banner::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(circle, rgba(255,153,0,0.1) 0%, transparent 80%);
  pointer-events: none;
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 800px;
}

.hero-title {
  font-family: var(--font-title);
  font-size: 2.8rem;
  font-weight: 800;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.2rem;
  color: var(--color-border);
  max-width: 600px;
  line-height: 1.5;
}

.hero-btn {
  padding: 12px 30px !important;
  font-size: 1.05rem !important;
}

.section-title {
  font-family: var(--font-title);
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 24px;
  text-align: center;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
}

.category-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 32px 16px;
  text-align: center;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-normal);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.category-card:hover {
  transform: translateY(-5px);
  border-color: var(--color-accent);
  box-shadow: var(--shadow-md);
}

.category-icon {
  font-size: 3rem;
  transition: transform var(--transition-fast);
}

.category-card:hover .category-icon {
  transform: scale(1.15) rotate(-5deg);
}

.category-name {
  font-family: var(--font-title);
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--color-text);
}

.info-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.info-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  padding: 24px;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-card h3 {
  font-family: var(--font-title);
  color: var(--color-primary);
  font-size: 1.2rem;
  font-weight: 700;
}

.info-card p {
  color: var(--color-text-muted);
  font-size: 0.95rem;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
}
</style>
