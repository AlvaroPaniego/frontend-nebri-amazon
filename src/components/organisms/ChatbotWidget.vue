<template>
  <div class="chatbot-widget-container" :class="{ 'is-open': isOpen }">
    <!-- Botón flotante para abrir el chat -->
    <button
      v-if="!isOpen"
      class="chatbot-trigger-btn"
      @click="toggleChat"
      aria-label="Abrir asistente virtual de NebriAmazon"
      type="button"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="trigger-icon"
        aria-hidden="true"
      >
        <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a48.203 48.203 0 0 1 0 7.214c-.114 1.866-1.483 3.478-3.405 3.727a49.736 49.736 0 0 1-5.743.396 2.25 2.25 0 0 0-1.745.828l-2.91 3.56a.75.75 0 0 1-1.317-.49v-3.79c-1.644-.09-3.218-.282-4.717-.571a3.864 3.864 0 0 1-3.218-3.183 48.264 48.264 0 0 1 0-7.214C1.622 4.519 2.99 2.907 4.913 2.658Z" />
      </svg>
      <span class="trigger-text">Asistente</span>
    </button>

    <!-- Ventana del chat -->
    <section
      v-else
      class="chatbot-window"
      aria-label="Ventana de chat del Asistente Virtual"
    >
      <!-- Cabecera -->
      <header class="chatbot-header">
        <div class="header-info">
          <div class="bot-avatar">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="avatar-icon"
              aria-hidden="true"
            >
              <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="header-titles">
            <h2 class="header-title">Asistente Virtual</h2>
            <span class="header-subtitle">NebriAmazon</span>
          </div>
        </div>
        <button
          class="close-btn"
          @click="toggleChat"
          aria-label="Cerrar asistente virtual"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2.5"
            stroke="currentColor"
            class="close-icon"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      <!-- Cuerpo del historial de mensajes -->
      <div
        ref="chatBodyRef"
        class="chatbot-body"
      >
        <div class="messages-list">
          <div
            v-for="msg in messages"
            :key="msg.id"
            :class="['message-wrapper', msg.sender === 'user' ? 'message-user' : 'message-bot']"
          >
            <div class="message-bubble">
              <p class="message-text">{{ msg.text }}</p>
              <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
            </div>
          </div>

          <!-- Indicador de bot escribiendo -->
          <div v-if="isTyping" class="message-wrapper message-bot">
            <div class="message-bubble typing-bubble" aria-label="El asistente está escribiendo">
              <div class="typing-indicator">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pie de página (Formulario de entrada) -->
      <footer class="chatbot-footer">
        <form @submit.prevent="handleSend" class="chatbot-input-form">
          <input
            v-model="inputText"
            type="text"
            placeholder="Escribe tu consulta aquí..."
            class="chatbot-input"
            aria-label="Escribe tu mensaje para el asistente"
            ref="inputRef"
            :disabled="isTyping"
          />
          <button
            type="submit"
            class="send-btn"
            aria-label="Enviar mensaje"
            :disabled="!inputText.trim() || isTyping"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="send-icon"
              aria-hidden="true"
            >
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </form>
      </footer>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';

// Definición de la estructura de un mensaje de chat
interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

// Variables de estado reactivas locales
const isOpen = ref(false);
const inputText = ref('');
const isTyping = ref(false);
const chatBodyRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);

// Historial inicializado con un saludo estático corporativo
const messages = ref<Message[]>([
  {
    id: 'msg-initial',
    sender: 'bot',
    text: '¡Hola! Soy el asistente virtual de NebriAmazon. ¿En qué puedo ayudarte hoy?',
    timestamp: new Date()
  }
]);

/**
 * Alterna el estado de visibilidad del widget de chat.
 */
const toggleChat = () => {
  isOpen.value = !isOpen.value;
};

/**
 * Realiza un scroll suave hasta el final del cuerpo del chat
 * garantizando que el usuario visualice siempre el último mensaje.
 */
const scrollToBottom = async () => {
  await nextTick();
  if (chatBodyRef.value) {
    chatBodyRef.value.scrollTo({
      top: chatBodyRef.value.scrollHeight,
      behavior: 'smooth'
    });
  }
};

/**
 * Formatea un objeto Date a formato de hora de lectura fácil (HH:MM)
 */
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Procesa el envío del mensaje del usuario y simula la respuesta asíncrona de la API.
 * 
 * TODO de integración futura con Axios:
 * Para conectar con el backend real en producción, sustituir la simulación del setTimeout por una llamada
 * a la capa de servicios en `src/services/chatbotService.js` de la siguiente manera:
 * 
 * ```typescript
 * import { sendMessageToChatbot } from '@/services/chatbotService';
 * 
 * try {
 *   isTyping.value = true;
 *   await scrollToBottom();
 *   const replyData = await sendMessageToChatbot(userText);
 *   messages.value.push({
 *     id: `msg-bot-${Date.now()}`,
 *     sender: 'bot',
 *     text: replyData.reply,
 *     timestamp: new Date()
 *   });
 * } catch (error) {
 *   console.error('Error al comunicar con el chatbot:', error);
 *   messages.value.push({
 *     id: `msg-error-${Date.now()}`,
 *     sender: 'bot',
 *     text: 'Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo.',
 *     timestamp: new Date()
 *   });
 * } finally {
 *   isTyping.value = false;
 *   await scrollToBottom();
 * }
 * ```
 */
const handleSend = async () => {
  const userText = inputText.value.trim();
  if (!userText) return;

  // Añadir mensaje del usuario de forma reactiva
  const userMessage: Message = {
    id: `msg-user-${Date.now()}`,
    sender: 'user',
    text: userText,
    timestamp: new Date()
  };

  messages.value.push(userMessage);
  inputText.value = '';
  await scrollToBottom();

  // Activar el estado animado de procesamiento asíncrono
  isTyping.value = true;
  await scrollToBottom();

  // Simulación de latencia de red de la API (1 segundo)
  setTimeout(async () => {
    isTyping.value = false;

    const botMessage: Message = {
      id: `msg-bot-${Date.now()}`,
      sender: 'bot',
      text: 'Estoy procesando tu solicitud sobre NebriAmazon. En un momento te daré más información...',
      timestamp: new Date()
    };

    messages.value.push(botMessage);
    await scrollToBottom();
  }, 1000);
};

// Observar el estado de apertura para forzar el scroll e inicializar foco
watch(isOpen, async (newValue) => {
  if (newValue) {
    await scrollToBottom();
    // Esperar al siguiente ciclo de renderizado para enfocar el input de forma accesible
    await nextTick();
    inputRef.value?.focus();
  }
});
</script>

<style scoped>
.chatbot-widget-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  font-family: var(--font-sans, 'Inter', sans-serif);
}

/* Botón flotante para abrir el asistente */
.chatbot-trigger-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--color-accent, hsl(36, 100%, 50%));
  color: #111111; /* Contraste óptimo con el naranja */
  border: none;
  border-radius: 50px;
  padding: 12px 20px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: var(--shadow-lg, 0 10px 25px rgba(0, 0, 0, 0.15));
  transition: transform var(--transition-fast, 0.15s), background-color var(--transition-fast, 0.15s), box-shadow var(--transition-fast, 0.15s);
  outline: none;
}

.chatbot-trigger-btn:hover {
  background-color: var(--color-accent-hover, hsl(36, 100%, 45%));
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);
}

.chatbot-trigger-btn:focus-visible {
  outline: 3px solid var(--color-primary);
  outline-offset: 2px;
}

.trigger-icon {
  width: 20px;
  height: 20px;
}

.trigger-text {
  user-select: none;
}

/* Ventana del Chat */
.chatbot-window {
  display: flex;
  flex-direction: column;
  width: 360px;
  height: 400px;
  background-color: var(--color-surface, #ffffff);
  border-radius: 16px;
  box-shadow: var(--shadow-lg, 0 10px 25px rgba(0, 0, 0, 0.15));
  border: 1px solid var(--color-border, hsl(220, 12%, 88%));
  overflow: hidden;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Cabecera del Chat */
.chatbot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--color-primary, hsl(220, 27%, 10%));
  color: #ffffff;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bot-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  color: var(--color-accent, hsl(36, 100%, 50%));
}

.avatar-icon {
  width: 20px;
  height: 20px;
}

.header-titles {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
}

.header-subtitle {
  font-size: 0.75rem;
  color: var(--color-accent, hsl(36, 100%, 50%));
  font-weight: 500;
}

.close-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition-fast, 0.15s), color var(--transition-fast, 0.15s);
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.close-btn:focus-visible {
  outline: 2px solid var(--color-accent);
}

.close-icon {
  width: 20px;
  height: 20px;
}

/* Cuerpo del chat con scroll */
.chatbot-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background-color: var(--color-background, hsl(0, 0%, 97%));
  scroll-behavior: smooth;
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message-wrapper {
  display: flex;
  width: 100%;
}

.message-user {
  justify-content: flex-end;
}

.message-bot {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 16px;
  position: relative;
  box-shadow: var(--shadow-sm, 0 2px 4px rgba(0, 0, 0, 0.05));
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-user .message-bubble {
  background-color: var(--color-surface, #ffffff);
  color: var(--color-text, hsl(220, 20%, 15%));
  border-bottom-right-radius: 4px;
  border: 1px solid var(--color-border, hsl(220, 12%, 88%));
}

.message-bot .message-bubble {
  background-color: var(--color-primary-light, hsl(220, 27%, 16%));
  color: #ffffff;
  border-bottom-left-radius: 4px;
}

.message-text {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.4;
  word-break: break-word;
}

.message-time {
  font-size: 0.68rem;
  align-self: flex-end;
  opacity: 0.7;
}

.message-user .message-time {
  color: var(--color-text-muted, hsl(220, 10%, 50%));
}

.message-bot .message-time {
  color: rgba(255, 255, 255, 0.7);
}

/* Indicador de escritura del bot */
.typing-bubble {
  padding: 12px 16px;
  background-color: var(--color-primary-light, hsl(220, 27%, 16%)) !important;
  border-bottom-left-radius: 4px;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  height: 12px;
}

.typing-dot {
  width: 7px;
  height: 7px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  animation: typingBounce 1.4s infinite ease-in-out both;
}

.typing-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typingBounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1.1);
    opacity: 1;
  }
}

/* Footer / Entrada de texto */
.chatbot-footer {
  padding: 12px;
  background-color: var(--color-surface, #ffffff);
  border-top: 1px solid var(--color-border, hsl(220, 12%, 88%));
}

.chatbot-input-form {
  display: flex;
  gap: 8px;
  align-items: center;
}

.chatbot-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid var(--color-border, hsl(220, 12%, 88%));
  border-radius: 24px;
  font-size: 0.88rem;
  outline: none;
  color: var(--color-text, hsl(220, 20%, 15%));
  background-color: var(--color-background, hsl(0, 0%, 97%));
  transition: border-color var(--transition-fast, 0.15s), background-color var(--transition-fast, 0.15s);
}

.chatbot-input:focus {
  border-color: var(--color-accent, hsl(36, 100%, 50%));
  background-color: var(--color-surface, #ffffff);
  box-shadow: 0 0 0 2px rgba(255, 153, 0, 0.2);
}

.chatbot-input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  background-color: var(--color-accent, hsl(36, 100%, 50%));
  color: #111111;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color var(--transition-fast, 0.15s), transform var(--transition-fast, 0.15s), opacity var(--transition-fast, 0.15s);
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background-color: var(--color-accent-hover, hsl(36, 100%, 45%));
  transform: scale(1.05);
}

.send-btn:disabled {
  background-color: var(--color-border, hsl(220, 12%, 88%));
  color: var(--color-text-muted, hsl(220, 10%, 50%));
  cursor: not-allowed;
  opacity: 0.6;
}

.send-icon {
  width: 18px;
  height: 18px;
}
</style>
