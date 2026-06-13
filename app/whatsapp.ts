import { contactInfo } from "./contact-info";

export function whatsappUrl(message: string, phone = contactInfo.whatsapp) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export const whatsappMessages = {
  general:
    "Hola, quiero recibir asesoría de Distribuciones LYM para productos o servicios de piscina.",
  product(productName: string, category: string) {
    return [
      "Hola, quiero cotizar este producto:",
      `Producto: ${productName}`,
      `Categoría: ${category}`,
      "¿Me confirman precio, disponibilidad y tiempo de entrega?",
    ].join("\n");
  },
  cart(lines: string, delivery: string) {
    return [
      "Hola, quiero cotizar este pedido:",
      lines,
      `Entrega: ${delivery}`,
      "¿Me confirman total, disponibilidad y forma de pago?",
    ].join("\n");
  },
  service(serviceName: string) {
    return [
      "Hola, quiero recibir información sobre este servicio:",
      `Servicio: ${serviceName}`,
      "¿Me pueden indicar alcance, disponibilidad y valor aproximado?",
    ].join("\n");
  },
  offer(productName: string) {
    return [
      "Hola, quiero consultar esta oferta:",
      `Producto: ${productName}`,
      "¿Me confirman precio de promoción y disponibilidad?",
    ].join("\n");
  },
  order(orderCode: string) {
    return [
      "Hola, quiero consultar el estado de mi pedido.",
      `Pedido: ${orderCode}`,
      "¿Me ayudan con la actualización?",
    ].join("\n");
  },
  quote(quoteCode: string) {
    return [
      "Hola, quiero revisar esta cotización de Distribuciones LYM.",
      `Cotización: ${quoteCode}`,
      "¿Me confirman precios, vigencia y forma de pago?",
    ].join("\n");
  },
  advisor(problem?: string) {
    return [
      "Hola, quiero asesoría para mi piscina.",
      problem ? `Problema seleccionado: ${problem}` : "",
      "¿Me ayudan a elegir los productos correctos?",
    ]
      .filter(Boolean)
      .join("\n");
  },
};
