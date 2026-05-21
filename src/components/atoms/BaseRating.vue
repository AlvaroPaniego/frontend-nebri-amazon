<template>
  <div class="base-rating" aria-label="Valoración del producto">
    <span
      v-for="star in 5"
      :key="star"
      :class="['star', { 'star-filled': star <= Math.round(value) }]"
    >
      ★
    </span>
    <span v-if="showValue" class="rating-text">({{ value.toFixed(1) }})</span>
  </div>
</template>

<script setup>
defineProps({
  value: {
    type: Number,
    default: 4.5,
  },
  showValue: {
    type: Boolean,
    default: true,
  }
});
</script>

<style scoped>
.base-rating {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.star {
  color: var(--color-border);
  font-size: 1.1rem;
  user-select: none;
  transition: color var(--transition-fast);
}

.star-filled {
  color: var(--color-accent);
}

.rating-text {
  font-family: var(--font-body);
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-left: 4px;
}
</style>
