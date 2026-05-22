<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  count: {
    type: [Number, String],
    default: 0
  }
})

const isPopping = ref(false)

watch(() => props.count, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    isPopping.value = true
  }
})

const handleAnimationEnd = () => {
  isPopping.value = false
}
</script>

<template>
  <span 
    v-show="count > 0"
    class="base-badge" 
    :class="{ 'badge-pop': isPopping }"
    @animationend="handleAnimationEnd"
  >
    {{ count }}
  </span>
</template>

<style scoped>
.base-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-accent);
  color: var(--color-primary);
  font-weight: 700;
  font-size: 0.75rem;
  min-width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  padding: 0 0.25rem;
  position: absolute;
  top: -6px;
  right: -8px;
  user-select: none;
  pointer-events: none;
  box-shadow: var(--shadow-sm);
}

.badge-pop {
  animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.4); }
  100% { transform: scale(1); }
}
</style>
