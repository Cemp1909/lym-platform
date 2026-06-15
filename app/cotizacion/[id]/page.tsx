import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, ShoppingCart } from "lucide-react";
import { InfoFooter, InfoHeader } from "../../info-layout";
import { PrintButton } from "../../print-button";
import { products } from "../../products";
import { createSupabaseAdminClient } from "../../supabase/admin";
import { whatsappMessages, whatsappUrl } from "../../whatsapp";

export const metadata: Metadata = {
  title: "Cotización",
  description: "Cotización pública para pedidos de Distribuciones LYM.",
};

type QuoteItem = {
  id: number;
  name: string;
  category: string;
  image: string;
  price: number | null;
  quantity: number;
};

type QuoteOrder = {
  customer_name: string;
  delivery_zone: string | null;
  delivery_address: string | null;
  delivery_cost: number | null;
  subtotal: number | null;
  total: number | null;
  created_at: string;
  order_items?: Array<{
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number | null;
    product_id: number | null;
    products?: {
      category: string | null;
      image_url: string | null;
    } | null;
  }>;
};

async function getQuoteOrder(id: string) {
  try {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("orders")
      .select(
        `
        customer_name,
        delivery_zone,
        delivery_address,
        delivery_cost,
        subtotal,
        total,
        created_at,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          unit_price,
          products (
            category,
            image_url
          )
        )
      `,
      )
      .eq("code", id)
      .single();

    return data as QuoteOrder | null;
  } catch {
    return null;
  }
}

function money(value: number | null | undefined) {
  if (!value) return "Por confirmar";

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function CotizacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getQuoteOrder(id);
  const quoteItems: QuoteItem[] = order?.order_items?.length
    ? order.order_items.map((item) => ({
        id: item.id,
        name: item.product_name,
        category: item.products?.category || "Productos",
        image: item.products?.image_url || "/brand/logo.png",
        price: item.unit_price,
        quantity: item.quantity,
      }))
    : products.slice(0, 4).map((product, index) => ({
        ...product,
        quantity: index + 1,
      }));
  const issueDateObject = order
    ? new Date(order.created_at)
    : new Date("2026-06-14T00:00:00-05:00");
  const validUntilObject = new Date(issueDateObject);

  validUntilObject.setDate(issueDateObject.getDate() + 7);

  const issueDate = issueDateObject.toLocaleDateString("es-CO");
  const validUntil = validUntilObject.toLocaleDateString("es-CO");
  const subtotal =
    order?.subtotal ??
    quoteItems.reduce(
      (total, item) => total + (item.price || 0) * item.quantity,
      0,
    );
  const deliveryCost = order?.delivery_cost ?? null;
  const total = order?.total ?? subtotal + (deliveryCost || 0);

  return (
    <main className="min-h-screen bg-[#F8FAFB] text-[#062A3E]">
      <InfoHeader active="Cotización" />

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="print-card rounded-lg border border-[#0A3D5C]/10 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-[#0A3D5C]/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative size-16 overflow-hidden rounded-lg border border-[#0A3D5C]/10 bg-white">
                <Image
                  src="/brand/logo.png"
                  alt="Logo Distribuciones LYM"
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              </div>
              <div>
                <p className="font-display text-2xl font-bold">
                  Cotización {id}
                </p>
                <p className="text-sm text-[#617789]">
                  Distribuciones LYM · Soluciones para su piscina
                </p>
              </div>
            </div>
            <div className="no-print flex gap-2">
              <PrintButton />
              <a
                href={whatsappUrl(whatsappMessages.quote(id))}
                className="flex h-10 items-center gap-2 rounded-lg border border-[#0A3D5C]/12 px-4 text-sm font-bold text-[#0A3D5C]"
              >
                <MessageCircle className="size-4" />
                WhatsApp
              </a>
            </div>
          </div>

          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-4">
            {[
              ["Fecha", issueDate],
              ["Vigencia", validUntil],
              ["Cliente", order?.customer_name || "Cliente LYM"],
              [
                "Entrega",
                order?.delivery_address ||
                  order?.delivery_zone ||
                  "Villavicencio / recoger en punto",
              ],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-[#F8FAFB] p-3">
                <p className="text-xs font-bold uppercase text-[#617789]">
                  {label}
                </p>
                <p className="mt-1 font-bold text-[#0A3D5C]">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 overflow-hidden rounded-lg border border-[#0A3D5C]/10">
            <div className="hidden grid-cols-[80px_1fr_90px_120px_120px] bg-[#F8FAFB] px-3 py-2 text-xs font-bold uppercase text-[#617789] sm:grid">
              <span>Foto</span>
              <span>Producto</span>
              <span>Cantidad</span>
              <span>Unitario</span>
              <span>Total</span>
            </div>
            {quoteItems.map((item) => (
              <div
                key={item.id}
                className="grid gap-3 border-b border-[#0A3D5C]/10 p-3 last:border-b-0 sm:grid-cols-[80px_1fr_90px_120px_120px]"
              >
                <div className="relative size-16 overflow-hidden rounded-lg bg-[#F8FAFB]">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="64px"
                    className="object-contain p-1"
                  />
                </div>
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-[#617789]">{item.category}</p>
                </div>
                <p className="text-sm font-bold">Cant. {item.quantity}</p>
                <p className="text-sm font-bold text-[#FF6B35]">
                  {item.price === null ? "Cotizar" : money(item.price)}
                </p>
                <p className="text-sm font-bold text-[#0A3D5C]">
                  {item.price === null
                    ? "Por confirmar"
                    : money(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="rounded-lg bg-[#F8FAFB] p-4 text-sm leading-6 text-[#617789]">
              <p className="font-bold text-[#0A3D5C]">Observaciones</p>
              <p className="mt-2">
                Los productos marcados como “Cotizar” requieren confirmación de
                precio y disponibilidad antes del pago. La entrega se coordina
                según zona, horario y disponibilidad del pedido.
              </p>
            </div>
            <div className="rounded-lg border border-[#0A3D5C]/10 bg-white p-4">
              <div className="flex justify-between text-sm">
                <span className="text-[#617789]">Subtotal confirmado</span>
                <span className="font-bold text-[#0A3D5C]">{money(subtotal)}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-[#617789]">Domicilio</span>
                <span className="font-bold text-[#0A3D5C]">{money(deliveryCost)}</span>
              </div>
              <div className="mt-3 flex justify-between border-t border-[#0A3D5C]/10 pt-3 font-display text-xl font-bold">
                <span>Total</span>
                <span className="text-[#FF6B35]">{money(total)}</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Link
              href="/#catalogo"
              className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#FF6B35] px-4 text-sm font-bold text-white"
            >
              <ShoppingCart className="size-4" />
              Ver tienda
            </Link>
            <p className="rounded-lg bg-[#F8FAFB] px-4 py-3 text-sm text-[#617789]">
              Los valores se confirman antes del despacho o cobro real por Wompi.
            </p>
          </div>
        </div>
      </section>

      <InfoFooter />
    </main>
  );
}
