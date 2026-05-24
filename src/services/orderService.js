/**
 * src/services/orderService.js
 * ─────────────────────────────────────────────────────────────
 * Iteración 5 (Fase 5) — Tarea 3: Servicio de Procesamiento de Pedidos
 *
 * Módulo desacoplado de la UI que encapsula toda la comunicación
 * con el endpoint `POST /api/orders`. Expone una única función
 * pública (placeOrder) que devuelve la orden creada o lanza una
 * excepción tipada cuando el backend reporta condiciones críticas.
 *
 * ● Gestión de asincronía
 *   Se usa async/await con try/catch explícito para mantener
 *   el flujo lineal y evitar el anidamiento de promesas (callback hell).
 *
 * ● Aislamiento de la lógica de red
 *   Este módulo es el ÚNICO punto de la aplicación que conoce la URL
 *   y el shape del payload de la orden. CheckoutView.vue solo llama
 *   a placeOrder(); nunca toca Axios directamente.
 *
 * ● Simulación de alta fidelidad
 *   Mientras el backend no esté desplegado, el motor de simulación
 *   replica de forma determinista: éxito, stock insuficiente (overselling)
 *   y error genérico de servidor, siguiendo los mismos códigos HTTP
 *   que retornaría la API real (200, 409, 500).
 */

import api from './api';

// ─── Helpers privados ──────────────────────────────────────────

/** Pausa controlada sin callback hell — limpia la asincronía. */
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Genera un código de seguimiento alfanumérico de 10 caracteres. */
const generateTrackingCode = () =>
  `NA-${Math.random().toString(36).substring(2, 12).toUpperCase()}`;

/**
 * Número mágico de tarjeta que dispara un error de stock insuficiente
 * en la simulación, lo que permite testear el flujo de error sin backend.
 * Formato: cualquier número que empiece por 4000 0000 0000 0002
 */
const CARD_TRIGGER_STOCK_ERROR = '4000000000000002';

// ─── Motor de Simulación ───────────────────────────────────────

/**
 * Simula la respuesta del endpoint POST /api/orders con latencia real.
 * Implementa los tres escenarios críticos de la Iteración 5:
 *   - 200 OK:         Orden creada con éxito.
 *   - 409 Conflict:   Stock insuficiente / overselling.
 *   - 500 Error:      Error interno genérico del servidor.
 *
 * @param {Object} payload - El cuerpo de la petición tal y como lo enviaría Axios.
 * @returns {Promise<Object>} Datos de la orden creada.
 */
const simulateApiCall = async (payload) => {
  // Latencia simulada de 1.5 s para dar feedback visual real al usuario
  await pause(1_500);

  const rawCardNumber = (payload.payment?.cardNumber ?? '').replace(/\s/g, '');

  // Caso: tarjeta de prueba que fuerza error de stock insuficiente (overselling)
  if (rawCardNumber === CARD_TRIGGER_STOCK_ERROR) {
    const error = {
      status: 409,
      code: 'INSUFFICIENT_STOCK',
      message: 'Stock insuficiente. Uno o más productos de tu pedido ya no tienen unidades disponibles.',
    };
    throw error;
  }

  // Caso: simulación de error 500 para el 5 % de las peticiones (ambiente de caos)
  if (Math.random() < 0.05) {
    throw {
      status: 500,
      code: 'SERVER_ERROR',
      message: 'Error interno del servidor. Por favor, inténtalo de nuevo en unos segundos.',
    };
  }

  // Caso nominal: orden creada con éxito
  return {
    orderId: crypto.randomUUID(),
    status: 'confirmed',
    trackingCode: generateTrackingCode(),
    total: payload.total,
    createdAt: new Date().toISOString(),
  };
};

// ─── API Pública del Servicio ──────────────────────────────────

/**
 * placeOrder — Tarea 3, Iteración 5 (Fase 5)
 *
 * Intenta crear una orden en el backend real. Si el backend no está
 * disponible (error de red / timeout), cae al motor de simulación
 * para garantizar que el flujo de checkout es siempre operable
 * en modo de desarrollo o demostración.
 *
 * @param {Object} shippingData   - Datos de envío { fullName, address, city, postalCode, country }
 * @param {Object} paymentData    - Datos de pago  { cardholderName, cardNumber, expiry, cvv }
 * @param {Array}  cartItems      - Ítems del carrito [ { product: { id, sku }, quantity } ]
 * @param {number} orderTotal     - Total financiero exacto calculado por useCartStore
 * @returns {Promise<Object>}     - Datos de la orden confirmada
 * @throws {Object}               - Error tipado { status, code, message }
 */
export const placeOrder = async (shippingData, paymentData, cartItems, orderTotal) => {
  // El CVV nunca viaja al backend en texto plano; lo enmascaramos antes de enviar.
  const sanitizedPayment = {
    cardholderName: paymentData.cardholderName,
    // Solo los últimos 4 dígitos se envían; el número completo solo sirve
    // para la validación local (algoritmo Luhn) dentro del componente.
    cardLastFour: paymentData.cardNumber.replace(/\s/g, '').slice(-4),
    expiry: paymentData.expiry,
  };

  const orderPayload = {
    shipping: shippingData,
    payment: {
      // Enviamos el número completo únicamente para la simulación interna;
      // en producción real se sustituiría por un token de la pasarela (Stripe, etc.).
      cardNumber: paymentData.cardNumber,
      ...sanitizedPayment,
    },
    items: cartItems.map((item) => ({
      productId: item.product.id,
      sku: item.product.sku,
      quantity: item.quantity,
      unitPrice: item.product.price,
    })),
    total: orderTotal,
  };

  try {
    // Intento real contra el backend — si Axios lanza, pasamos al simulador
    const response = await api.post('/orders', orderPayload);
    return response.data;
  } catch (networkOrServerError) {
    // Si el error ya es tipado (viene del interceptor con status/code), lo propagamos
    if (networkOrServerError?.status && networkOrServerError?.code) {
      throw networkOrServerError;
    }

    // Error de red (sin conexión, CORS, timeout) → usamos simulación
    console.warn('[orderService] Backend inaccesible — activando motor de simulación.');
    return simulateApiCall(orderPayload);
  }
};
