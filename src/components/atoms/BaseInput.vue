<template>
  <div class="base-input-wrapper">
    <label v-if="label" :for="id" class="input-label">{{ label }}</label>
    <div :class="['input-container', { 'has-error': error, 'is-focused': focused }]">
      <input
        :id="id"
        :type="type"
        :placeholder="placeholder"
        :value="modelValue"
        :disabled="disabled"
        @input="onInput"
        @focus="focused = true"
        @blur="focused = false"
        class="input-field"
      />
    </div>
    <span v-if="error" class="error-message float-in">{{ error }}</span>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: () => 'input-' + Math.random().toString(36).substr(2, 9),
  }
});

const emit = defineEmits(['update:modelValue']);
const focused = ref(false);

const onInput = (event) => {
  emit('update:modelValue', event.target.value);
};
</script>

<style scoped>
.base-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.input-label {
  font-family: var(--font-title);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
}

.input-container {
  display: flex;
  align-items: center;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  padding: 0 12px;
  min-height: 44px;
}

.input-field {
  width: 100%;
  height: 100%;
  padding: 10px 0;
  font-size: 0.95rem;
  color: var(--color-text);
  background: transparent;
  outline: none;
}

.input-field::placeholder {
  color: var(--color-text-muted);
  opacity: 0.8;
}

/* Focused State */
.input-container.is-focused {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(255, 153, 0, 0.15);
}

/* Error State */
.input-container.has-error {
  border-color: var(--color-error);
}

.input-container.has-error.is-focused {
  box-shadow: 0 0 0 3px rgba(240, 68, 68, 0.15);
}

.error-message {
  font-size: 0.75rem;
  color: var(--color-error);
  font-weight: 500;
}
</style>
