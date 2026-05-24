<script setup>
/**
 * src/components/organisms/CheckoutForm.vue
 * ─────────────────────────────────────────────────────────────
 * Iteración 5 (Fase 5) — Tarea 1: Formulario Reactivo de Checkout
 *
 * Organismo que agrupa todos los campos necesarios para completar
 * una compra: datos de envío + datos de tarjeta bancaria.
 *
 * Responsabilidades de este componente:
 *  - Validar cada campo en tiempo real (computed + watchers).
 *  - Implementar el algoritmo de Luhn para verificar tarjetas.
 *  - Formatear el número de tarjeta con espacios cada 4 dígitos.
 *  - Gestionar los estados visuales: idle → loading → error/success.
 *  - Emitir el evento `submit` con los datos validados al padre (CheckoutView).
 *
 * La lógica de red NO vive aquí; este componente solo valida y emite.
 * (Principio de Responsabilidad Única — Clean Code, Capítulo 3)
 */

import { ref, computed, watch } from 'vue';

// ─── Props & Emits ─────────────────────────────────────────────
const props = defineProps({
  /** Bloquea el formulario mientras CheckoutView procesa la orden */
  isLoading: {
    type: Boolean,
    default: false,
  },
  /** Mensaje de error propagado desde el servicio de órdenes */
  serverError: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['submit']);

// ─── Estado reactivo del formulario ───────────────────────────
const shipping = ref({
  fullName: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
});

const payment = ref({
  cardholderName: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
});

/** Indica si el usuario ya intentó enviar el formulario (activa mensajes de error) */
const submitted = ref(false);

// ─── Algoritmo de Luhn ─────────────────────────────────────────
/**
 * Verifica la integridad matemática de un número de tarjeta.
 * Algoritmo estándar ISO/IEC 7812 para validación de checksums.
 * @param {string} rawNumber - Número sin espacios
 * @returns {boolean}
 */
const isValidLuhn = (rawNumber) => {
  if (!rawNumber || rawNumber.length < 13) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = rawNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(rawNumber[i], 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

// ─── Formateo de la tarjeta en tiempo real ─────────────────────
/**
 * Formatea el número de tarjeta como "XXXX XXXX XXXX XXXX"
 * mientras el usuario escribe, sin alterar el valor subyacente.
 */
const handleCardNumberInput = (event) => {
  const raw = event.target.value.replace(/\D/g, '').slice(0, 16);
  // Insertar espacios cada 4 dígitos
  payment.value.cardNumber = raw.replace(/(.{4})/g, '$1 ').trim();
};

/** Formateo automático MM/AA para la fecha de expiración */
const handleExpiryInput = (event) => {
  const raw = event.target.value.replace(/\D/g, '').slice(0, 4);
  if (raw.length >= 3) {
    payment.value.expiry = `${raw.slice(0, 2)}/${raw.slice(2)}`;
  } else {
    payment.value.expiry = raw;
  }
};

// ─── Validaciones Computadas ───────────────────────────────────

const cardNumberRaw = computed(() => payment.value.cardNumber.replace(/\s/g, ''));

const errors = computed(() => ({
  // Envío
  fullName:    !shipping.value.fullName.trim()    ? 'El nombre completo es obligatorio.'    : '',
  address:     !shipping.value.address.trim()     ? 'La dirección es obligatoria.'          : '',
  city:        !shipping.value.city.trim()        ? 'La ciudad es obligatoria.'             : '',
  postalCode:  !/^\d{4,10}$/.test(shipping.value.postalCode) ? 'Código postal inválido.'   : '',
  country:     !shipping.value.country.trim()     ? 'El país es obligatorio.'               : '',

  // Pago
  cardholderName: !payment.value.cardholderName.trim()
    ? 'El nombre del titular es obligatorio.'
    : '',
  cardNumber: !isValidLuhn(cardNumberRaw.value)
    ? 'Número de tarjeta inválido. Verifica los 16 dígitos.'
    : '',
  expiry: (() => {
    const parts = payment.value.expiry.split('/');
    if (parts.length !== 2) return 'Formato inválido (MM/AA).';
    const month = parseInt(parts[0], 10);
    const year  = parseInt(`20${parts[1]}`, 10);
    if (month < 1 || month > 12) return 'Mes inválido (01–12).';
    const now = new Date();
    const cardDate = new Date(year, month - 1);
    if (cardDate < new Date(now.getFullYear(), now.getMonth())) {
      return 'La tarjeta está caducada.';
    }
    return '';
  })(),
  cvv: !/^\d{3,4}$/.test(payment.value.cvv)
    ? 'CVV inválido (3 o 4 dígitos).'
    : '',
}));

/** true si todos los campos están limpios de errores */
const isFormValid = computed(() =>
  Object.values(errors.value).every((msg) => msg === ''),
);

// ─── Envío del Formulario ──────────────────────────────────────
const handleSubmit = () => {
  submitted.value = true;

  if (!isFormValid.value) return;

  // Emitimos al padre los datos validados; la llamada de red ocurre allí.
  emit('submit', {
    shipping: { ...shipping.value },
    payment: { ...payment.value },
  });
};
</script>

<template>
  <!-- Iteración 5, Tarea 1: Formulario reactivo de envío y pago -->
  <form
    class="checkout-form"
    novalidate
    aria-label="Formulario de pago y envío"
    @submit.prevent="handleSubmit"
  >
    <!-- ── Sección: Datos de Envío ── -->
    <fieldset class="form-section">
      <legend class="section-title">
        <span class="section-icon" aria-hidden="true">📦</span>
        Datos de Envío
      </legend>

      <!-- Nombre Completo -->
      <div class="field-group">
        <label class="field-label" for="cf-full-name">Nombre completo</label>
        <input
          id="cf-full-name"
          v-model="shipping.fullName"
          type="text"
          class="field-input"
          :class="{ 'field-input--error': submitted && errors.fullName }"
          autocomplete="name"
          placeholder="María García López"
          aria-required="true"
          :aria-invalid="submitted && !!errors.fullName"
          :aria-describedby="submitted && errors.fullName ? 'err-full-name' : undefined"
        />
        <span
          v-if="submitted && errors.fullName"
          id="err-full-name"
          class="field-error"
          role="alert"
        >
          {{ errors.fullName }}
        </span>
      </div>

      <!-- Dirección -->
      <div class="field-group">
        <label class="field-label" for="cf-address">Dirección</label>
        <input
          id="cf-address"
          v-model="shipping.address"
          type="text"
          class="field-input"
          :class="{ 'field-input--error': submitted && errors.address }"
          autocomplete="street-address"
          placeholder="Calle Mayor, 42, 3.º B"
          aria-required="true"
          :aria-invalid="submitted && !!errors.address"
        />
        <span v-if="submitted && errors.address" class="field-error" role="alert">
          {{ errors.address }}
        </span>
      </div>

      <!-- Ciudad + Código Postal -->
      <div class="field-row">
        <div class="field-group">
          <label class="field-label" for="cf-city">Ciudad</label>
          <input
            id="cf-city"
            v-model="shipping.city"
            type="text"
            class="field-input"
            :class="{ 'field-input--error': submitted && errors.city }"
            autocomplete="address-level2"
            placeholder="Madrid"
            aria-required="true"
          />
          <span v-if="submitted && errors.city" class="field-error" role="alert">
            {{ errors.city }}
          </span>
        </div>

        <div class="field-group">
          <label class="field-label" for="cf-postal-code">Código postal</label>
          <input
            id="cf-postal-code"
            v-model="shipping.postalCode"
            type="text"
            class="field-input"
            :class="{ 'field-input--error': submitted && errors.postalCode }"
            autocomplete="postal-code"
            placeholder="28001"
            maxlength="10"
            aria-required="true"
          />
          <span v-if="submitted && errors.postalCode" class="field-error" role="alert">
            {{ errors.postalCode }}
          </span>
        </div>
      </div>

      <!-- País -->
      <div class="field-group">
        <label class="field-label" for="cf-country">País</label>
        <select
          id="cf-country"
          v-model="shipping.country"
          class="field-input field-select"
          :class="{ 'field-input--error': submitted && errors.country }"
          autocomplete="country-name"
          aria-required="true"
        >
          <option value="" disabled>Selecciona un país…</option>
          <option value="España">España</option>
          <option value="México">México</option>
          <option value="Argentina">Argentina</option>
          <option value="Colombia">Colombia</option>
          <option value="Chile">Chile</option>
          <option value="Perú">Perú</option>
          <option value="Estados Unidos">Estados Unidos</option>
          <option value="Otro">Otro</option>
        </select>
        <span v-if="submitted && errors.country" class="field-error" role="alert">
          {{ errors.country }}
        </span>
      </div>
    </fieldset>

    <!-- ── Sección: Datos de Pago ── -->
    <fieldset class="form-section">
      <legend class="section-title">
        <span class="section-icon" aria-hidden="true">💳</span>
        Datos de Pago Simulado
      </legend>

      <!-- Titular de la Tarjeta -->
      <div class="field-group">
        <label class="field-label" for="cf-cardholder-name">Nombre en la tarjeta</label>
        <input
          id="cf-cardholder-name"
          v-model="payment.cardholderName"
          type="text"
          class="field-input"
          :class="{ 'field-input--error': submitted && errors.cardholderName }"
          autocomplete="cc-name"
          placeholder="MARIA GARCIA"
          aria-required="true"
        />
        <span v-if="submitted && errors.cardholderName" class="field-error" role="alert">
          {{ errors.cardholderName }}
        </span>
      </div>

      <!-- Número de Tarjeta (con formato + Luhn) -->
      <div class="field-group">
        <label class="field-label" for="cf-card-number">Número de tarjeta</label>
        <div class="card-number-wrapper">
          <input
            id="cf-card-number"
            :value="payment.cardNumber"
            type="text"
            class="field-input card-number-input"
            :class="{ 'field-input--error': submitted && errors.cardNumber }"
            autocomplete="cc-number"
            placeholder="1234 5678 9012 3456"
            maxlength="19"
            inputmode="numeric"
            aria-required="true"
            :aria-invalid="submitted && !!errors.cardNumber"
            @input="handleCardNumberInput"
          />
          <!-- Icono de red de tarjeta (decorativo) -->
          <span class="card-brand-icon" aria-hidden="true">
            <svg width="36" height="24" viewBox="0 0 36 24" fill="none">
              <rect width="36" height="24" rx="4" fill="hsl(220,27%,15%)"/>
              <circle cx="14" cy="12" r="7" fill="hsl(0,84%,60%)" fill-opacity="0.85"/>
              <circle cx="22" cy="12" r="7" fill="hsl(36,100%,50%)" fill-opacity="0.85"/>
            </svg>
          </span>
        </div>
        <span v-if="submitted && errors.cardNumber" class="field-error" role="alert">
          {{ errors.cardNumber }}
        </span>
        <span class="field-hint">
          Tarjeta de prueba: <code>4111 1111 1111 1111</code> (válida) |
          <code>4000 0000 0000 0002</code> (simula stock insuficiente)
        </span>
      </div>

      <!-- Expiración + CVV -->
      <div class="field-row">
        <div class="field-group">
          <label class="field-label" for="cf-expiry">Vencimiento (MM/AA)</label>
          <input
            id="cf-expiry"
            :value="payment.expiry"
            type="text"
            class="field-input"
            :class="{ 'field-input--error': submitted && errors.expiry }"
            autocomplete="cc-exp"
            placeholder="08/27"
            maxlength="5"
            inputmode="numeric"
            aria-required="true"
            @input="handleExpiryInput"
          />
          <span v-if="submitted && errors.expiry" class="field-error" role="alert">
            {{ errors.expiry }}
          </span>
        </div>

        <div class="field-group">
          <label class="field-label" for="cf-cvv">CVV</label>
          <input
            id="cf-cvv"
            v-model="payment.cvv"
            type="password"
            class="field-input"
            :class="{ 'field-input--error': submitted && errors.cvv }"
            autocomplete="cc-csc"
            placeholder="•••"
            maxlength="4"
            inputmode="numeric"
            aria-required="true"
          />
          <span v-if="submitted && errors.cvv" class="field-error" role="alert">
            {{ errors.cvv }}
          </span>
        </div>
      </div>
    </fieldset>

    <!-- ── Error propagado desde el servidor ── -->
    <div v-if="serverError" class="server-error-banner" role="alert" aria-live="assertive">
      <span class="error-icon" aria-hidden="true">⚠️</span>
      {{ serverError }}
    </div>

    <!-- ── CTA de Envío ── -->
    <button
      id="checkout-submit-btn"
      type="submit"
      class="submit-btn"
      :disabled="isLoading"
      :aria-busy="isLoading"
      aria-label="Confirmar y pagar ahora"
    >
      <span v-if="!isLoading" class="btn-content">
        <span aria-hidden="true">🔒</span>
        Confirmar y Pagar Ahora
      </span>
      <span v-else class="btn-loading" aria-label="Procesando pago…">
        <span class="spinner" aria-hidden="true"></span>
        Procesando…
      </span>
    </button>
  </form>
</template>

<style scoped>
/* ── Layout del formulario ── */
.checkout-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* ── Sección / Fieldset ── */
.form-section {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.75rem;
  background-color: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  letter-spacing: -0.2px;
}

.section-icon {
  font-size: 1.1rem;
}

/* ── Grupos de campo ── */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1.25rem;
}

.field-group:last-child {
  margin-bottom: 0;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

/* ── Labels e Inputs ── */
.field-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.4px;
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

.field-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 2.5rem;
}

/* ── Número de tarjeta ── */
.card-number-wrapper {
  position: relative;
}

.card-number-input {
  padding-right: 3.5rem;
  letter-spacing: 0.12em;
  font-variant-numeric: tabular-nums;
}

.card-brand-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

/* ── Hints y Errores ── */
.field-hint {
  font-size: 0.73rem;
  color: var(--color-text-muted);
  margin-top: 0.15rem;
  line-height: 1.5;
}

.field-hint code {
  font-family: 'Courier New', monospace;
  background-color: hsl(220, 12%, 93%);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  font-size: 0.7rem;
}

.field-error {
  font-size: 0.78rem;
  color: var(--color-error);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  animation: errorSlideIn 0.2s ease-out;
}

@keyframes errorSlideIn {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Banner de error del servidor ── */
.server-error-banner {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 1rem 1.25rem;
  background-color: hsl(0, 84%, 96%);
  border: 1px solid hsl(0, 84%, 80%);
  border-left: 4px solid var(--color-error);
  border-radius: 8px;
  color: hsl(0, 70%, 35%);
  font-size: 0.9rem;
  font-weight: 500;
  animation: errorSlideIn 0.25s ease-out;
}

.error-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}

/* ── Botón CTA ── */
.submit-btn {
  width: 100%;
  padding: 1rem 2rem;
  background: linear-gradient(
    135deg,
    var(--color-accent) 0%,
    var(--color-accent-hover) 100%
  );
  color: var(--color-primary);
  border: none;
  border-radius: 10px;
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.3px;
  cursor: pointer;
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast),
    opacity var(--transition-fast);
  box-shadow: 0 4px 14px hsla(36, 100%, 50%, 0.4);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px hsla(36, 100%, 50%, 0.55);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.75;
  cursor: not-allowed;
  transform: none;
}

.btn-content,
.btn-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* ── Spinner de carga ── */
.spinner {
  width: 18px;
  height: 18px;
  border: 2.5px solid var(--color-primary);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Responsividad ── */
@media (max-width: 600px) {
  .field-row {
    grid-template-columns: 1fr;
  }

  .form-section {
    padding: 1.25rem;
  }
}
</style>
