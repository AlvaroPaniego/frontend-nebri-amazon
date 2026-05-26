/**
 * src/services/productService.js
 * ─────────────────────────────────────────────────────────────
 * Iteración 3 (Fase 3) — Tarea 1: Servicio de Productos
 *
 * Módulo desacoplado de la UI que encapsula toda la comunicación con
 * los endpoints de catálogo y productos. Expone métodos asíncronos limpios
 * que retornan directamente response.data.
 *
 * ● Principios SOLID & Clean Code:
 *   - Responsabilidad Única (SRP): Aísla por completo el transporte HTTP.
 *   - Robustez ante Fallos: En caso de que el backend esté inactivo o haya
 *     errores de red, activa de forma transparente un motor de simulación local
 *     de alta fidelidad para garantizar que la app siga siendo 100% interactiva.
 */

import api from './api';

// Helper de utilidad para simular latencia de red en modo offline de forma limpia
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// =========================================================================
// MOTOR DE SIMULACIÓN DE ALTA FIDELIDAD (MOCK DATA FALLBACK)
// =========================================================================

const MOCK_CATEGORIES = [
  { id: 1, name: 'Electrónica' },
  { id: 2, name: 'Hogar y Cocina' },
  { id: 3, name: 'Libros' },
  { id: 4, name: 'Deportes' }
];

const MOCK_PRODUCTS = [
  {
    id: 'b75c87e1-8f5d-4f10-91a1-f3b174786278',
    name: 'Auriculares Inalámbricos Premium ANC',
    description: 'Auriculares circumaurales inalámbricos premium con tecnología ANC híbrida, controladores dinámicos de 40 mm, autonomía de hasta 35 horas y carga ultra rápida por USB-C. Sonido de alta fidelidad con graves profundos y agudos cristalinos.',
    price: 129.99,
    stock: 24,
    sku: 'ELEC-ANC-001',
    category_id: 1,
    image_urls: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80']
  },
  {
    id: 'f87a8f1e-4509-4cd8-b0a3-dce564906f39',
    name: 'Teclado Mecánico RGB NebriType Pro',
    description: 'Teclado mecánico para gaming y programación al 75% de factor de forma. Cuenta con interruptores mecánicos intercambiables en caliente (hot-swappable), retroiluminación RGB direccionable individualmente por tecla, chasis de aluminio de calidad aeroespacial y doble capa de espuma amortiguadora de sonido.',
    price: 89.50,
    stock: 15,
    sku: 'ELEC-KB-002',
    category_id: 1,
    image_urls: ['https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80']
  },
  {
    id: 'b0efb672-87ff-43f1-bd12-bc78a0e363df',
    name: 'Cafetera Superautomática Italiana',
    description: 'Cafetera espresso superautomática con molinillo cónico de acero inoxidable integrado (13 ajustes de molienda). Panel de control táctil intuitivo de un solo toque para Espresso, Café y Cappuccino. Sistema de vaporización profesional ajustable para una espuma cremosa de alta calidad.',
    price: 499.00,
    stock: 8,
    sku: 'HOG-CAF-003',
    category_id: 2,
    image_urls: ['https://images.unsplash.com/photo-1517256064527-09c53b2d0c6b?w=800&auto=format&fit=crop&q=80']
  },
  {
    id: '5037be3a-6ff8-498c-9c71-331045ef9de1',
    name: 'Robot Aspirador Láser 3D',
    description: 'Robot aspirador de última generación con tecnología de navegación LiDAR láser 3D. Potencia de succión líder en el sector de 4000 Pa, mopa vibratoria integrada para limpieza húmeda profunda, compatibilidad con Alexa y Google Home, y depósito de autovaciado inteligente.',
    price: 349.00,
    stock: 12,
    sku: 'HOG-ASP-004',
    category_id: 2,
    image_urls: ['https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80']
  },
  {
    id: 'a9cb84e7-4f1b-4fde-9bc0-8809ffde143e',
    name: 'Clean Code: Robert C. Martin',
    description: 'El libro clásico e imprescindible de Robert C. Martin (Uncle Bob) sobre desarrollo y mejores prácticas de ingeniería de software. Aprende a escribir código altamente legible, mantenible, modular y a aplicar los principios SOLID paso a paso con casos prácticos reales.',
    price: 37.95,
    stock: 50,
    sku: 'LIB-CC-005',
    category_id: 3,
    image_urls: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80']
  },
  {
    id: 'd9b047a1-2d7c-47bc-ae58-1fbc811ef932',
    name: 'Mochila Técnica Senderismo 45L',
    description: 'Mochila de montaña técnica para travesías largas, fabricada con nylon ripstop de alta resistencia. Cuenta con una capacidad de 45 litros más extensión de 5 litros, funda impermeable oculta integrada, compartimento aislado para bolsa de hidratación, silbato de emergencia en hebilla y arnés ergonómico regulable en altura.',
    price: 75.00,
    stock: 20,
    sku: 'DEP-MOCH-006',
    category_id: 4,
    image_urls: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80']
  }
];

// =========================================================================
// API PÚBLICA DEL SERVICIO
// =========================================================================

/**
 * getProducts - Obtiene el listado completo de productos desde el backend.
 * Realiza un fallback automático a simulación si la API no está disponible.
 *
 * @returns {Promise<Array>} Lista de productos
 */
export const getProducts = async () => {
  try {
    const response = await api.get('/products');
    // Retorna directamente los datos
    return response.data;
  } catch (error) {
    console.warn('[productService] API /products inaccesible — activando simulación local.');
    await delay(600); // Retraso realista de red
    return MOCK_PRODUCTS;
  }
};

/**
 * getProductBySku - Obtiene la ficha de un producto específico mediante su SKU.
 * En el backend, las búsquedas suelen basarse en el ID, por lo que esta función
 * consulta la colección general y extrae el producto por SKU de forma inteligente
 * para asegurar total compatibilidad.
 *
 * @param {string} sku - El SKU único del producto
 * @returns {Promise<Object>} Ficha técnica del producto
 */
export const getProductBySku = async (sku) => {
  if (!sku) {
    throw new Error('El SKU del producto es obligatorio.');
  }

  try {
    // Intentamos buscarlo primero en la colección remota
    const products = await getProducts();
    const product = products.find(p => p.sku === sku);
    
    if (product) {
      return product;
    }
    
    // Si no está por SKU, probamos directamente por ID si el SKU era realmente un ID
    const response = await api.get(`/products/${sku}`);
    return response.data;
  } catch (error) {
    console.warn(`[productService] Error buscando SKU ${sku} — cayendo al motor de simulación.`);
    await delay(500);
    
    const product = MOCK_PRODUCTS.find(p => p.sku.toUpperCase() === sku.toUpperCase() || p.id === sku);
    if (!product) {
      throw {
        status: 404,
        code: 'NOT_FOUND',
        message: `Producto con SKU o ID "${sku}" no encontrado.`
      };
    }
    return product;
  }
};

/**
 * getCategories - Obtiene todas las categorías disponibles en el sistema.
 * Realiza un fallback a simulación si la API no responde.
 *
 * @returns {Promise<Array>} Lista de categorías
 */
export const getCategories = async () => {
  try {
    const response = await api.get('/categories');
    return response.data;
  } catch (error) {
    console.warn('[productService] API /categories inaccesible — activando simulación local.');
    await delay(400);
    return MOCK_CATEGORIES;
  }
};
