<script setup>
/**
 * src/components/atoms/BaseInput.vue
 * ─────────────────────────────────────────────────────────────
 * Componente atómico de entrada de texto reutilizable y accesible.
 * Proporciona soporte para etiquetas, validación, mensajes de error y
 * estados de deshabilitación, garantizando consistencia visual y de comportamiento.
 */

defineProps({
  /** ID único para relacionar la etiqueta y el input (accesibilidad) */
  id: {
    type: String,
    required: true
  },
  /** Valor vinculado mediante v-model */
  modelValue: {
    type: [String, Number],
    default: ''
  },
  /** Etiqueta visible del campo */
  label: {
    type: String,
    required: true
  },
  /** Tipo de entrada: text, email, password, etc. */
  type: {
    type: String,
    default: 'text'
  },
  /** Placeholder decorativo */
  placeholder: {
    type: String,
    default: ''
  },
  /** Mensaje de error para mostrar bajo el input */
  error: {
    type: String,
    default: ''
  },
  /** Indica si el campo es obligatorio */
  required: {
    type: Boolean,
    default: false
  },
  /** Atributo autocomplete estándar del navegador */
  autocomplete: {
    type: String,
    default: undefined
  },
  /** Límite de caracteres */
  maxlength: {
    type: [String, Number],
    default: undefined
  },
  /** Modo de entrada virtual en dispositivos móviles */
  inputmode: {
    type: String,
    default: undefined
  },
  /** Deshabilita la interacción visual y de teclado */
  disabled: {
    type: Boolean,
    default: false
  }
});

defineEmits(['update:modelValue', 'blur', 'focus']);
</script>

<template>
  <div class="field-group">
    <label :for="id" class="field-label">
      {{ label }}
      <span v-if="required" class="required-star" aria-hidden="true">*</span>
    </label>
    
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :autocomplete="autocomplete"
      :maxlength="maxlength"
      :inputmode="inputmode"
      :disabled="disabled"
      class="field-input"
      :class="{ 'field-input--error': error }"
      :aria-required="required"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${id}-error` : undefined"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur', $event)"
      @focus="$emit('focus', $event)"
    />
    
    <span
      v-if="error"
      :id="`${id}-error`"
      class="field-error"
      role="alert"
    >
      <span class="error-bullet" aria-hidden="true">⚠️</span>
      {{ error }}
    </span>
  </div>
</template>

<style scoped>
.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1.25rem;
  text-align: left;
  width: 100%;
}

.field-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.required-star {
  color: var(--color-error);
  margin-left: 2px;
}

.field-input {
  padding: 0.7rem 1rem;
  border: 1.5px solid var(--color-border);
  border-radius: 8px;
  font-family: var(--font-sans);
  font-size: 0.95rem;
  color: var(--color-text);
  background-color: var(--color-background);
  transition:
    border-color var(--transition-fast),
    box-shadow var(--transition-fast);
  outline: none;
  width: 100%;
}

.field-input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px hsla(36, 100%, 50%, 0.18);
}

.field-input--error {
  border-color: var(--color-error);
  background-color: hsl(0, 84%, 97%);
}

.field-input--error:focus {
  box-shadow: 0 0 0 3px hsla(0, 84%, 60%, 0.18);
}

.field-input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background-color: var(--color-border);
}

.field-error {
  font-size: 0.78rem;
  color: var(--color-error);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  animation: errorSlideIn 0.2s ease-out;
  margin-top: 0.15rem;
}

.error-bullet {
  font-size: 0.85rem;
}

@keyframes errorSlideIn {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
