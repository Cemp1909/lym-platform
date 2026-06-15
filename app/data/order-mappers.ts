import {
  sanitizeEmail,
  sanitizeLongText,
  sanitizePhone,
  sanitizeText,
} from "../security/sanitize";

export type OrderLinePayload = {
  productId: number;
  name: string;
  quantity: number;
  unitPrice: number | null;
};

export type OrderPayload = {
  customerToken: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  deliveryMethod: string;
  deliveryAddress?: string;
  deliveryZone: string;
  deliveryNotes?: string;
  deliveryCost: number;
  subtotal: number;
  total: number;
  paymentMethod: string;
  items: OrderLinePayload[];
};

export type DbOrderItem = {
  id: number;
  product_id: number | null;
  product_name: string;
  quantity: number;
  unit_price: number | null;
  total: number | null;
};

export type DbDeliveryAssignment = {
  courier_name: string;
  cost: number | null;
  delivery_window: string | null;
  notes: string | null;
};

export type DbOrder = {
  id: number;
  code: string;
  customer_name: string;
  customer_email?: string | null;
  customer_phone: string | null;
  customer_token?: string | null;
  status: string;
  delivery_method: string;
  delivery_address: string | null;
  delivery_zone: string | null;
  delivery_cost: number | null;
  delivery_notes?: string | null;
  subtotal: number | null;
  total: number | null;
  wompi_reference: string | null;
  payment_method?: string | null;
  created_at: string;
  order_items?: DbOrderItem[];
  delivery_assignments?: DbDeliveryAssignment[];
};

const statusToUi: Record<string, string> = {
  payment_pending: "Pago pendiente",
  paid: "Pagado",
  preparing: "Preparando",
  in_delivery: "En domicilio",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const uiToStatus: Record<string, string> = {
  "Pago pendiente": "payment_pending",
  Pagado: "paid",
  Preparando: "preparing",
  "En domicilio": "in_delivery",
  Entregado: "delivered",
  Cancelado: "cancelled",
};

export function statusFromDb(status: string) {
  return statusToUi[status] || "Pago pendiente";
}

export function statusToDb(status: string) {
  return uiToStatus[status] || "payment_pending";
}

export function generateOrderCode() {
  const date = new Date();
  const datePart = date
    .toISOString()
    .slice(2, 10)
    .replaceAll("-", "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);

  return `LYM-${datePart}-${randomPart}`;
}

export function cleanOrderPayload(payload: OrderPayload): OrderPayload {
  return {
    customerToken: sanitizeText(payload.customerToken, { maxLength: 96 }),
    customerName:
      sanitizeText(payload.customerName, { maxLength: 90 }) || "Cliente LYM",
    customerEmail: sanitizeEmail(payload.customerEmail || ""),
    customerPhone: sanitizePhone(payload.customerPhone || ""),
    deliveryMethod: sanitizeText(payload.deliveryMethod, { maxLength: 60 }),
    deliveryAddress: sanitizeText(payload.deliveryAddress || "", {
      maxLength: 180,
    }),
    deliveryZone: sanitizeText(payload.deliveryZone, { maxLength: 80 }),
    deliveryNotes: sanitizeLongText(payload.deliveryNotes || "", 300),
    deliveryCost: positiveInteger(payload.deliveryCost),
    subtotal: positiveInteger(payload.subtotal),
    total: positiveInteger(payload.total),
    paymentMethod: sanitizeText(payload.paymentMethod, { maxLength: 40 }),
    items: (payload.items || [])
      .map((item) => ({
        productId: positiveInteger(item.productId),
        name: sanitizeText(item.name, { maxLength: 160 }),
        quantity: Math.max(1, positiveInteger(item.quantity)),
        unitPrice:
          item.unitPrice === null || item.unitPrice === undefined
            ? null
            : positiveInteger(item.unitPrice),
      }))
      .filter((item) => item.productId && item.name),
  };
}

export function orderFromDb(row: DbOrder) {
  const assignment = row.delivery_assignments?.[0];
  const lines = (row.order_items || []).map((item) => ({
    name: item.product_name,
    quantity: item.quantity,
    unitPrice: item.unit_price || 0,
  }));
  const items = lines.reduce((total, line) => total + line.quantity, 0);
  const deliveryCost = assignment?.cost ?? row.delivery_cost ?? 0;
  const total = row.total ?? 0;

  return {
    id: row.code,
    client: row.customer_name,
    phone: row.customer_phone || "",
    delivery: row.delivery_zone || row.delivery_method,
    address: row.delivery_address || "Punto físico Distribuciones LYM",
    status: statusFromDb(row.status),
    items,
    total: total ? moneyFromNumber(total) : "Por definir",
    courier: assignment?.courier_name,
    deliveryCost: deliveryCost ? moneyFromNumber(deliveryCost) : undefined,
    deliveryWindow: assignment?.delivery_window || undefined,
    deliveryNotes: assignment?.notes || row.delivery_notes || undefined,
    lines,
  };
}

export function publicOrderFromDb(row: DbOrder) {
  const order = orderFromDb(row);

  return {
    ...order,
    createdAt: row.created_at,
    subtotal: row.subtotal || 0,
    totalValue: row.total || 0,
    deliveryCostValue: row.delivery_cost || 0,
    paymentMethod: row.payment_method || "wompi-test",
  };
}

function moneyFromNumber(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function positiveInteger(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}
