<template>
  <div class="chatbot-widget">
    <!-- Burbuja flotante -->
    <button
      v-if="!isOpen"
      @click="isOpen = true"
      class="chatbot-trigger"
      aria-label="Abrir asistente de NebriAmazon"
    >
      🤖
    </button>
    
    <!-- Ventana del Chatbot -->
    <div v-else class="chatbot-window float-in">
      <!-- Encabezado -->
      <div class="chatbot-header">
        <div class="chatbot-title">
          <span class="bot-avatar">🤖</span>
          <div>
            <h4>Asistente NebriAmazon</h4>
            <span class="bot-status">En línea y listo</span>
          </div>
        </div>
        <button @click="isOpen = false" class="close-btn" aria-label="Cerrar">×</button>
      </div>
      
      <!-- Contenedor de Historial de Conversación -->
      <div class="chatbot-messages" ref="messagesContainer">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['message-bubble', msg.sender === 'user' ? 'msg-user' : 'msg-bot']"
        >
          {{ msg.text }}
        </div>
        
        <!-- Animación de "Escribiendo..." -->
        <div v-if="isTyping" class="message-bubble msg-bot typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      
      <!-- Entrada de Texto y Envío -->
      <form @submit.prevent="handleSend" class="chatbot-footer">
        <input
          type="text"
          placeholder="Pregunta sobre stock, pedidos o ayuda..."
          v-model="userInput"
          :disabled="isTyping"
          class="chat-input"
          ref="inputField"
        />
        <button type="submit" :disabled="!userInput.trim() || isTyping" class="send-btn">
          ➤
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch } from 'vue';
import chatbotService from '@/services/chatbotService';

const isOpen = ref(false);
const userInput = ref('');
const isTyping = ref(false);
const messagesContainer = ref(null);
const inputField = ref(null);

const messages = ref([
  { sender: 'bot', text: '¡Hola! 🌌 Soy tu asistente inteligente de NebriAmazon. ¿En qué puedo ayudarte hoy? Puedo informarte sobre nuestros productos, stock, envíos o resolver tus dudas.' }
]);

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// Hace scroll automático y da el foco al input al abrir el chat
watch(isOpen, async (newVal) => {
  if (newVal) {
    await scrollToBottom();
    await nextTick();
    inputField.value?.focus();
  }
});

const handleSend = async () => {
  const text = userInput.value.trim();
  if (!text) return;

  // Insertar mensaje del usuario
  messages.value.push({ sender: 'user', text });
  userInput.value = '';
  await scrollToBottom();

  // Activar estado de escritura
  isTyping.value = true;
  await scrollToBottom();

  try {
    const data = await chatbotService.sendMessage(text);
    messages.value.push({ sender: 'bot', text: data.reply });
  } catch (error) {
    messages.value.push({ sender: 'bot', text: 'Lo siento, en este momento no puedo procesar tu consulta. Por favor, inténtalo más tarde.' });
  } finally {
    isTyping.value = false;
    await scrollToBottom();
    await nextTick();
    inputField.value?.focus();
  }
};
</script>

<style scoped>
.chatbot-widget {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  font-family: var(--font-body);
}

.chatbot-trigger {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-round);
  background-color: var(--color-accent);
  color: var(--color-primary);
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg);
  border: none;
  transition: all var(--transition-fast);
  outline: none;
}

.chatbot-trigger:hover {
  background-color: var(--color-accent-hover);
  transform: scale(1.1) rotate(10deg);
}

.chatbot-window {
  width: 350px;
  height: 480px;
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chatbot-header {
  background-color: var(--color-primary);
  color: var(--color-surface);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chatbot-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bot-avatar {
  font-size: 1.5rem;
}

.chatbot-title h4 {
  font-family: var(--font-title);
  font-size: 0.95rem;
  font-weight: 600;
}

.bot-status {
  font-size: 0.75rem;
  color: var(--color-success);
  display: block;
}

.close-btn {
  font-size: 1.5rem;
  color: var(--color-border);
  transition: color var(--transition-fast);
}

.close-btn:hover {
  color: var(--color-error);
}

.chatbot-messages {
  flex-grow: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: var(--color-background);
}

.message-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  line-height: 1.3;
}

.msg-bot {
  background-color: var(--color-surface);
  color: var(--color-text);
  align-self: flex-start;
  border-bottom-left-radius: 2px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
}

.msg-user {
  background-color: var(--color-primary-light);
  color: var(--color-surface);
  align-self: flex-end;
  border-bottom-right-radius: 2px;
  box-shadow: var(--shadow-sm);
}

/* Typing Indicator Animation */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background-color: var(--color-text-muted);
  border-radius: var(--radius-round);
  animation: bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.chatbot-footer {
  padding: 12px;
  display: flex;
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-border);
  gap: 8px;
}

.chat-input {
  flex-grow: 1;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  font-size: 0.85rem;
  outline: none;
  transition: border var(--transition-fast);
}

.chat-input:focus {
  border-color: var(--color-accent);
}

.send-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background-color: var(--color-primary);
  color: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  transition: all var(--transition-fast);
}

.send-btn:hover:not(:disabled) {
  background-color: var(--color-accent);
  color: var(--color-primary);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .chatbot-window {
    width: calc(100vw - 48px);
    height: 400px;
  }
}
</style>
