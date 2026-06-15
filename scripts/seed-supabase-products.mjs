import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const [key, ...value] = line.split("=");
      return [key, value.join("=")];
    }),
);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
}

const products = JSON.parse(
  readFileSync("data/precios-productos-lym-maestro.json", "utf8"),
);

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

function availability(label) {
  if (label === "Disponible para confirmar") return "available_to_confirm";
  if (label === "Bajo pedido") return "on_request";
  if (label === "Agotado temporalmente") return "temporarily_unavailable";
  return "check_availability";
}

function status(label) {
  if (label === "Publicado") return "published";
  if (label === "Depurar") return "needs_cleanup";
  if (label === "Oferta activa") return "offer_active";
  if (label === "Oculto") return "hidden";
  if (label === "Bajo pedido") return "on_request";
  return "pending_price";
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "y")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

const rows = products.map((product) => {
  const price = product.precio_provisional_cop
    ? Number(product.precio_provisional_cop)
    : null;

  return {
    id: product.id,
    name: product.producto,
    slug: `${slugify(product.producto)}-${product.id}`,
    category: product.categoria,
    price,
    unit: price ? "Unidad" : "Precio por definir",
    stock: 1,
    availability: availability(product.disponibilidad),
    tag: product.categoria,
    image_url: product.imagen,
    status: status(product.estado),
    featured: product.id <= 8,
  };
});

const { error } = await supabase.from("products").upsert(rows, {
  onConflict: "id",
});

if (error) {
  throw error;
}

console.log(`Productos sincronizados en Supabase: ${rows.length}`);
