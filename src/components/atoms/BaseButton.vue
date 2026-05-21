<template>
  <button
    :class="[
      'base-button',
      `btn-${variant}`,
      { 'btn-loading': loading, 'btn-disabled': disabled || loading }
    ]"
    :disabled="disabled || loading"
    :type="type"
  >
    <span v-if="loading" class="spinner"></span>
    <slot v-else></slot>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary', // primary, secondary, text, danger
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'button'
  }
});
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  font-family: var(--font-title);
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  outline: none;
  gap: 8px;
  min-height: 44px;
  position: relative;
  user-select: none;
}

/* Primary Button - Orange Accent (Amazon Style) */
.btn-primary {
  background-color: var(--color-accent);
  color: var(--color-primary);
  border: 1px solid hsl(36, 100%, 42%);
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--color-accent-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

/* Secondary Button - Navy Control */
.btn-secondary {
  background-color: var(--color-primary-light);
  color: var(--color-surface);
  border: 1px solid var(--color-primary);
}

.btn-secondary:hover:not(:disabled) {
  background-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

/* Danger Button - Fire Red */
.btn-danger {
  background-color: var(--color-error);
  color: var(--color-surface);
}

.btn-danger:hover:not(:disabled) {
  background-color: hsl(0, 84%, 50%);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

/* Text Button */
.btn-text {
  background-color: transparent;
  color: var(--color-primary);
  padding: 5px 10px;
  min-height: auto;
}

.btn-text:hover:not(:disabled) {
  color: var(--color-accent);
}

/* Loading & Disabled States */
.btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.btn-loading {
  cursor: wait;
}

/* Spinner vector animation */
.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-round);
  border-top-color: currentColor;
  animation: spin 0.8s infinite linear;
}
</style>
