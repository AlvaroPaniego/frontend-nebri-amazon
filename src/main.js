import { createApp } from 'vue';
import { createPinia } from 'pinia';
//import HomeView from '@/views/HomeView.vue';
import App from '@/App.vue';        // <--- Usando alias
import router from '@/router';      // <--- Usando alias

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');