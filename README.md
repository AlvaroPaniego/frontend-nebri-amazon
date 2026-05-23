# NebriAmazon — Frontend

> Interfaz de usuario de **NebriAmazon**, un e-commerce académico desarrollado en el programa IABD de la Universidad Nebrija. Construida sobre Vue 3 + Vite siguiendo la metodología **Atomic Design** y un sistema de diseño corporativo basado en variables HSL.

---

## Tabla de Contenidos

- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura: Atomic Design](#arquitectura-atomic-design)
- [Sistema de Diseño](#sistema-de-diseño)
- [Componentes Implementados](#componentes-implementados)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación y Puesta en Marcha](#instalación-y-puesta-en-marcha)
- [Roadmap Completo](#roadmap-completo)

---

## Stack Tecnológico

| Tecnología | Versión | Rol |
|---|---|---|
| **Vue 3** | `^3.5.0` | Framework reactivo (Composition API + `<script setup>`) |
| **Vite** | `^5.2.11` | Bundler y servidor de desarrollo ultrarrápido |
| **Pinia** | `^2.1.7` | Gestión de estado global (carrito, sesión) |
| **Vue Router** | `^4.3.2` | Enrutamiento SPA declarativo |
| **Axios** | `^1.6.8` | Cliente HTTP para comunicación con la API |
| **Vanilla CSS** | — | Estilos encapsulados con variables CSS custom properties |

---

## Arquitectura: Atomic Design

El proyecto estructura todos sus componentes visuales siguiendo la metodología **Atomic Design** de Brad Frost, organizando la UI en capas de complejidad creciente:

```
src/components/
│
├── atoms/          ← Unidades indivisibles (BaseBadge, BaseButton…)
│
├── molecules/      ← Combinación de átomos con lógica propia (SearchBar…)
│
└── organisms/      ← Secciones completas reutilizables (AppNavbar, ChatBot…)
```

> **¿Por qué Atomic Design?** Maximiza la reutilización, garantiza coherencia visual entre páginas y facilita el mantenimiento a medida que el catálogo de componentes crece.

### Jerarquía Visual

```
Átomos → Moléculas → Organismos → Plantillas → Páginas (Views)
```

---

## Sistema de Diseño

El design system está definido íntegramente en `src/assets/variables.css` mediante **CSS Custom Properties** en escala HSL, lo que permite ajustes de tono y luminosidad de forma semántica.

### Paleta de Color

| Token | Valor HSL | Uso |
|---|---|---|
| `--color-primary` | `hsl(220, 27%, 10%)` | Fondo navbar, cabeceras oscuras |
| `--color-primary-light` | `hsl(220, 27%, 16%)` | Menú móvil desplegado |
| `--color-accent` | `hsl(36, 100%, 50%)` | Naranja Amazon — CTAs, badge, botón búsqueda |
| `--color-accent-hover` | `hsl(36, 100%, 45%)` | Estado activo del acento |
| `--color-background` | `hsl(0, 0%, 97%)` | Fondo general de la aplicación |
| `--color-surface` | `hsl(0, 0%, 100%)` | Tarjetas, inputs, superficies elevadas |
| `--color-text` | `hsl(220, 20%, 15%)` | Texto principal — máximo contraste |
| `--color-text-muted` | `hsl(220, 10%, 50%)` | Textos auxiliares, placeholders |
| `--color-border` | `hsl(220, 12%, 88%)` | Bordes y separadores sutiles |
| `--color-success` | `hsl(142, 70%, 45%)` | Stock disponible, confirmaciones |
| `--color-error` | `hsl(0, 84%, 60%)` | Alertas, stock agotado |
| `--color-warning` | `hsl(45, 93%, 47%)` | Advertencias de proceso |

### Tipografía

```css
--font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

La fuente corporativa es **Inter** — legible, moderna y optimizada para interfaces de alta densidad de información.

### Elevación y Movimiento

```css
/* Sombras */
--shadow-sm:  0 2px 4px  rgba(0, 0, 0, 0.05);
--shadow-md:  0 4px 12px rgba(0, 0, 0, 0.08);
--shadow-lg:  0 10px 25px rgba(0, 0, 0, 0.12);

/* Transiciones */
--transition-fast:   0.15s cubic-bezier(0.4, 0, 0.2, 1);
--transition-normal: 0.3s  cubic-bezier(0.4, 0, 0.2, 1);
```

---

## Componentes Implementados

### ⚛️ Átomos — `src/components/atoms/`

#### `BaseBadge.vue`

Indicador numérico circular (contador de carrito). Incluye una **micro-animación pop** reactiva: cuando el valor de la prop `count` cambia, el badge escala a 1.4× y vuelve a su tamaño original vía `@keyframes pop`, creando feedback visual inmediato.

| Prop | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `count` | `Number \| String` | `0` | Número a mostrar. Se oculta si `count === 0` |

```vue
<BaseBadge :count="cartItemsTotal" />
```

---

### 🧬 Moléculas — `src/components/molecules/`

#### `SearchBar.vue`

Formulario de búsqueda completo. Combina un `<input>` controlado con v-model, un botón de limpieza condicional (`×`) y un botón de envío con icono SVG inline. Emite el evento `search` al componente padre.

| Evento emitido | Payload | Descripción |
|---|---|---|
| `search` | `String` | Consulta actual del usuario (vacío al limpiar) |

**Características de accesibilidad:** `aria-label` en todos los controles interactivos, `@submit.prevent` en el form para evitar recarga, `focus-within` con ring de acento naranja.

```vue
<SearchBar @search="onSearchHandler" />
```

---

### 🏗️ Organismos — `src/components/organisms/`

#### `AppNavbar.vue`

Barra de navegación principal responsiva que **orquesta** `SearchBar` y `BaseBadge`. Implementa:

- **Diseño sticky** (`position: sticky; top: 0; z-index: 1000`)
- **Menú hamburguesa** animado para móviles (`≤ 768px`) con estado booleano `isMobileMenuOpen`
- **Doble instancia de SearchBar**: visible en desktop (`flex: 1`) y en mobile (panel inferior)
- **Navegación semántica** mediante eventos `navigate` y `search` que propagan al parent

| Prop | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `cartCount` | `Number` | `0` | Número de ítems del carrito; se pasa a `BaseBadge` |

| Evento emitido | Payload | Descripción |
|---|---|---|
| `search` | `String` | Consulta de búsqueda |
| `navigate` | `String` | Destino: `'home'`, `'profile'`, `'orders'`, `'cart'` |

```vue
<AppNavbar
  :cart-count="cartStore.totalItems"
  @search="handleSearch"
  @navigate="router.push"
/>
```

---

## Estructura del Proyecto

```
frontend-nebri-amazon/
│
├── src/
│   ├── assets/
│   │   ├── variables.css        # Design tokens HSL (color, tipo, sombras)
│   │   └── main.css             # Reset global + import de variables
│   │
│   ├── components/
│   │   ├── atoms/
│   │   │   └── BaseBadge.vue    # Insignia numérica con animación pop
│   │   ├── molecules/
│   │   │   └── SearchBar.vue    # Campo de búsqueda con emit
│   │   └── organisms/
│   │       └── AppNavbar.vue    # Navbar responsiva (desktop + mobile)
│   │
│   ├── store/                   # (Próximo) Stores Pinia: carrito, sesión
│   └── views/                   # (Próximo) Vistas: Home, Login, Registro
│
├── package.json
└── README.md
```

> [!NOTE]
> Los directorios `store/` y `views/` se añadirán progresivamente según el roadmap de features. La arquitectura está diseñada para su incorporación sin fricción.

---

## Instalación y Puesta en Marcha

**Requisitos previos:** Node.js ≥ 18 y npm.

```bash
# 1. Entrar al directorio del frontend
cd frontend-nebri-amazon

# 2. Instalar dependencias
npm install

# 3. Arrancar el servidor de desarrollo
npm run dev
```

El servidor Vite estará disponible en `http://localhost:5173` con **Hot Module Replacement (HMR)** activo.

```bash
# Compilar para producción
npm run build

# Previsualizar el build de producción localmente
npm run preview
```

---

## Roadmap Completo

El desarrollo del frontend sigue un flujo de **feature branches** secuenciales, desde la configuración del design system hasta la orquestación final de la vista principal.

| Estado | Feature Branch | Descripción |
|---|---|---|
| 🟢 **Completado** | `feature/01-sistema-diseno` | **Configuración de Estilos Globales** — Variables HSL, tipografía corporativa (Inter) y reseteo base (`main.css` + `variables.css`) |
| 🟢 **Completado** | `feature/02-componente-navbar` | **Barra de Navegación Responsiva** — Integración de `AppNavbar.vue`, `SearchBar.vue` y `BaseBadge.vue` con animación pop |
| 🟡 **En progreso** | `feature/03-identificacion-usuarios` | **Autenticación y Gestión de Sesión** — Vistas Login/Registro en `src/views/` y estado de sesión en `src/store/` |
| 🟡 **En progreso** | `feature/04-gestión-carrito` | **Lógica de Estado del Carrito** — Gestión centralizada en `src/store/` para añadir/eliminar productos y calcular totales |
| 🟡 **En progreso** | `feature/05-componente-bot` | **Asistente Virtual Inteligente** — Maquetación y comportamiento del `ChatBot.vue` flotante |
| 🟡 **En progreso** | `feature/06-componente-categorías` | **Grid de Contenidos Responsivo** — Secciones principales (Tecnología, Hogar, etc.) |
| 🟡 **En progreso** | `feature/07-página-home` | **Orquestación Final** — Integración de todos los organismos en la vista principal `src/views/` |

> [!IMPORTANT]
> Cada feature branch se desarrolla en aislamiento y se integra a `main` mediante Pull Request con revisión de código. Esto garantiza que el design system permanezca coherente en cada iteración.

---

*Proyecto académico — Universidad Nebrija · IABD (G1) · Programación de IA · 2026*
