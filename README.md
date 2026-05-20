# 💻 NebriAmazon - Frontend Application 🛍️

[![Vite Version](https://img.shields.io/badge/Vite-%3E%3D%205.0.0-purple.svg?style=flat-square)](https://vitejs.dev/)
[![React Version](https://img.shields.io/badge/React-%3E%3D%2018.0.0-blue.svg?style=flat-square)](https://react.dev/)
[![Design System](https://img.shields.io/badge/CSS-Vanilla%20%2F%20Modern-orange.svg?style=flat-square)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

Este repositorio contiene la **interfaz de usuario** interactiva y moderna de **NebriAmazon**, una simulación de comercio electrónico inspirada en la plataforma de Amazon, desarrollada para la **Universidad Nebrija**.

El frontend ofrece una experiencia de usuario fluida, responsiva y estéticamente atractiva, conectándose a la API del backend para realizar consultas en tiempo real de productos, gestión de perfiles y finalización de compras.

---

## 🎨 Características de Diseño y UI

Nuestra interfaz prioriza una experiencia de usuario (UX) de primer nivel:

*   **Aesthetics Premium:** Paleta de colores cuidada, degradados suaves, sombras sutiles y tipografía moderna (ej. *Inter* u *Outfit*) para brindar una sensación profesional y limpia.
*   **Diseño Totalmente Responsivo:** Adaptado para una visualización perfecta en dispositivos móviles, tablets y ordenadores de escritorio.
*   **Micro-animaciones Dinámicas:** Transiciones fluidas en botones, efectos hover interactivos en tarjetas de productos y loaders animados que hacen sentir la app "viva".
*   **Navegación Intuitiva:** Barra de búsqueda avanzada, categorías accesibles y un flujo de compra rápido y libre de fricciones.

---

## 🛠️ Tecnologías y Herramientas

El proyecto está construido sobre tecnologías web rápidas y eficientes:

*   **Framework/Biblioteca principal:** [React.js](https://react.dev/) / [Vite](https://vitejs.dev/) (para un entorno de desarrollo ultrarrápido).
*   **Estilos:** CSS Vanilla Moderno (Custom Properties/Variables, CSS Grid, Flexbox) diseñado a medida para garantizar el control total de la estética.
*   **Enrutado:** React Router DOM (para navegación SPA fluida).
*   **Gestión de Estado:** React Context API para el estado global (ej. carrito de compras, sesión de usuario).
*   **Consumo de API:** Axios o Fetch API.

---

## 📂 Estructura del Proyecto

Estructura organizada orientada a componentes modulares:

```text
frontend-nebri-amazon/
├── public/             # Activos estáticos públicos (imágenes, iconos, favicon)
├── src/
│   ├── assets/         # Recursos estáticos importables (imágenes de marca, logos)
│   ├── components/     # Componentes reutilizables (Botones, Tarjetas, Navbar, Footer)
│   ├── context/        # Contextos globales de la app (AuthContext, CartContext)
│   ├── hooks/          # Custom hooks útiles (useFetch, useLocalStorage)
│   ├── pages/          # Páginas principales (Home, ProductDetail, Cart, Login, Checkout)
│   ├── services/       # Módulo para peticiones HTTP al backend (API endpoints wrapper)
│   ├── styles/         # Ficheros CSS globales y variables de diseño
│   ├── App.jsx         # Componente raíz y definición de rutas
│   └── main.jsx        # Punto de entrada de la aplicación React
├── index.html          # Estructura base HTML5
├── package.json        # Dependencias y scripts del proyecto
└── vite.config.js      # Configuración de Vite
```

---

## 🚀 Cómo Empezar (Desarrollo)

### 1. Requisitos Previos

Asegúrate de tener instalado:
*   [Node.js](https://nodejs.org/) (versión 18 o superior)
*   [npm](https://www.npmjs.com/) u otro gestor de paquetes (como [pnpm](https://pnpm.io/) o [yarn](https://yarnpkg.com/))

### 2. Instalación de Dependencias

Navega al directorio del frontend e instala las librerías necesarias:

```bash
cd frontend-nebri-amazon
npm install
```

### 3. Configuración de la API del Backend

Crea un archivo `.env` en la raíz de esta carpeta para indicar la URL de la API del backend:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Ejecución del Servidor de Desarrollo

Inicia el entorno local de desarrollo con Vite:

```bash
npm run dev
```

Vite abrirá la aplicación en tu navegador en la dirección `http://localhost:5173` (o similar).

---

## 🔒 Buenas Prácticas e Integridad

*   **Sin marcadores de posición:** Todos los elementos interactivos cuentan con funcionalidad demostrativa clara.
*   **SEO Optimizada:** Títulos descriptivos en cada página, uso correcto de etiquetas semánticas HTML5 (header, main, nav, section, footer) y jerarquía de encabezados única por página.
*   **Rendimiento:** Carga diferida de imágenes y optimización de assets para un renderizado ultra-rápido.
