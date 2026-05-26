import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            // Esto conecta el símbolo '@' con tu carpeta 'src'
            '@': path.resolve(__dirname, './src'),
        },
    },
});