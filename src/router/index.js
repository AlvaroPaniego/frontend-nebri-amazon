import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/LoginView.vue'; // <--- Importa la vista

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', name: 'Home', component: HomeView },
        { path: '/catalog', name: 'Catalog', component: HomeView },
        { path: '/login', name: 'Login', component: LoginView } // <--- Nueva ruta
    ]
});

export default router;