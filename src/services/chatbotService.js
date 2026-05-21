import api from './api';

export default {
  async sendMessage(messageText) {
    const response = await api.post('/chatbot', { message: messageText });
    return response.data; // { reply: "..." }
  }
};
