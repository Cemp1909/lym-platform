import type { Product } from "../products";

export type DbProduct = {
  id: number;
  name: string;
  category: string;
  price: number | null;
  unit: string | null;
  stock: number | null;
  availability: string | null;
  tag: string | null;
  image_url: string | null;
  status: string | null;
  featured: boolean | null;
};

export type AdminProductPayload = Product & {
  adminPrice?: string;
  active?: boolean;
  featured?: boolean;
  commerceStatus?: string;
};

const availabilityToStock: Record<string, number> = {
  available_to_confirm: 2,
  check_availability: 1,
  on_request: 0,
  temporarily_unavailable: -1,
};

const stockToAvailability: Record<number, string> = {
  2: "available_to_confirm",
  1: "check_availability",
  0: "on_request",
  [-1]: "temporarily_unavailable",
};

const statusToAdmin: Record<string, string> = {
  pending_price: "Pendiente de precio",
  published: "Publicado",
  hidden: "Oculto",
  on_request: "Bajo pedido",
  offer_active: "Oferta activa",
  needs_cleanup: "Depurar",
};

const adminToStatus: Record<string, string> = {
  "Pendiente de precio": "pending_price",
  Publicado: "published",
  Oculto: "hidden",
  "Bajo pedido": "on_request",
  "Oferta activa": "offer_active",
  Depurar: "needs_cleanup",
};

export function productFromDb(row: DbProduct): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price,
    unit: row.unit || (row.price ? "Unidad" : "Precio por definir"),
    stock:
      availabilityToStock[row.availability || ""] ??
      (typeof row.stock === "number" ? row.stock : 1),
    tag: row.tag || row.category,
    image: row.image_url || "/brand/logo.png",
  };
}

export function adminProductFromDb(row: DbProduct) {
  const product = productFromDb(row);

  return {
    ...product,
    adminPrice: row.price ? String(row.price) : "",
    active: row.status !== "hidden",
    featured: Boolean(row.featured),
    commerceStatus: statusToAdmin[row.status || ""] || "Pendiente de precio",
  };
}

export function productToDb(product: AdminProductPayload) {
  const price = Number(product.adminPrice || product.price || 0);
  const status = adminToStatus[product.commerceStatus || ""] || "pending_price";

  return {
    id: product.id,
    name: product.name,
    slug: `${slugify(product.name)}-${product.id}`,
    category: product.category,
    price: Number.isFinite(price) && price > 0 ? price : null,
    unit:
      Number.isFinite(price) && price > 0
        ? product.unit === "Precio por definir"
          ? "Unidad"
          : product.unit
        : "Precio por definir",
    stock: product.stock,
    availability: stockToAvailability[product.stock] || "check_availability",
    tag: product.tag || product.category,
    image_url: product.image,
    status: product.active === false ? "hidden" : status,
    featured: Boolean(product.featured),
  };
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "y")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}
