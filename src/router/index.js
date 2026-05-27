import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/LoginView.vue';
import CartView from '@/views/CartView.vue';
import CheckoutView from '@/views/CheckoutView.vue';
import RegisterView from '@/views/RegisterView.vue';

const router = createRouter({
        history: createWebHistory(),
        routes: [
                { path: '/', name: 'Home', component: HomeView },
                { path: '/catalog', name: 'Catalog', component: HomeView },
                { path: '/login', name: 'Login', component: LoginView },
                { path: '/cart', name: 'Cart', component: CartView },
                { path: '/checkout', name: 'Checkout', component: CheckoutView },
                { path: '/register', name: 'Register', component: RegisterView }

        ]
});

export default router;