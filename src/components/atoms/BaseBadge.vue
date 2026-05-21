<template>
  <span
    v-show="count > 0"
    :class="['base-badge', { 'badge-pop': animate }]"
  >
    {{ count }}
  </span>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  count: {
    type: Number,
    default: 0,
  }
});

const animate = ref(false);

// Dispara la animación de pop reactivamente cada vez que el conteo cambie
watch(() => props.count, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    animate.value = true;
    setTimeout(() => {
      animate.value = false;
    }, 300); // Duración de la animación en main.css
  }
});
</script>

<style scoped>
.base-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-accent);
  color: var(--color-primary);
  font-family: var(--font-title);
  font-size: 0.75rem;
  font-weight: 800;
  border-radius: var(--radius-round);
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  position: absolute;
  top: -6px;
  right: -8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  pointer-events: none;
  user-select: none;
}
</style>
