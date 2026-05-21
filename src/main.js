import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

// Instanciar la aplicación Vue
const app = createApp(App);

// Crear e inyectar el gestor de estado Pinia
const pinia = createPinia();
app.use(pinia);

// Inyectar el router de enrutamiento SPA
app.use(router);

// Montaje físico en el DOM (#app definido en index.html)
app.mount('#app');
