import { NextResponse } from "next/server";
import {
  cleanOrderPayload,
  generateOrderCode,
  publicOrderFromDb,
  type DbOrder,
  type OrderPayload,
} from "@/app/data/order-mappers";
import { createSupabaseAdminClient } from "@/app/supabase/admin";
import { sanitizeOrderCode, sanitizeText } from "@/app/security/sanitize";

const orderSelect = `
  id,
  code,
  customer_name,
  customer_email,
  customer_phone,
  customer_token,
  status,
  delivery_method,
  delivery_address,
  delivery_zone,
  delivery_cost,
  delivery_notes,
  subtotal,
  total,
  wompi_reference,
  payment_method,
  created_at,
  order_items (
    id,
    product_id,
    product_name,
    quantity,
    unit_price,
    total
  ),
  delivery_assignments (
    courier_name,
    cost,
    delivery_window,
    notes
  )
`;

async function getRequestUserId(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return null;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) return null;

  return data.user.id;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = sanitizeOrderCode(searchParams.get("code") || "");
  const customerToken = sanitizeText(searchParams.get("customerToken") || "", {
    maxLength: 96,
  });
  const userId = await getRequestUserId(request);

  if (!code && !customerToken && !userId) {
    return NextResponse.json(
      { error: "Envía el código del pedido o token del cliente." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();
  let query = supabase
    .from("orders")
    .select(orderSelect)
    .order("created_at", { ascending: false });

  if (code) {
    query = query.eq("code", code).limit(1);
  } else if (userId) {
    query = query.eq("user_id", userId).limit(12);
  } else {
    query = query.eq("customer_token", customerToken).limit(12);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const orders = ((data ?? []) as DbOrder[]).map(publicOrderFromDb);

  return NextResponse.json({ orders, order: orders[0] ?? null });
}

export async function POST(request: Request) {
  const payload = cleanOrderPayload((await request.json()) as OrderPayload);
  const userId = await getRequestUserId(request);

  if ((!payload.customerToken && !userId) || !payload.items.length) {
    return NextResponse.json(
      { error: "Faltan cliente o productos para crear el pedido." },
      { status: 400 },
    );
  }

  const hasPendingPrices = payload.items.some((item) => item.unitPrice === null);
  const supabase = createSupabaseAdminClient();
  const code = generateOrderCode();
  const subtotal = hasPendingPrices ? 0 : payload.subtotal;
  const deliveryCost = hasPendingPrices ? 0 : payload.deliveryCost;
  const total = hasPendingPrices ? 0 : payload.total;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      code,
      user_id: userId,
      customer_token: payload.customerToken,
      customer_name: payload.customerName,
      customer_email: payload.customerEmail || null,
      customer_phone: payload.customerPhone || null,
      status: hasPendingPrices ? "payment_pending" : "paid",
      delivery_method: payload.deliveryMethod,
      delivery_address: payload.deliveryAddress || null,
      delivery_zone: payload.deliveryZone,
      delivery_notes: payload.deliveryNotes || null,
      delivery_cost: deliveryCost,
      subtotal,
      total,
      wompi_reference: `WOMPI-TEST-${code}`,
      payment_method: payload.paymentMethod,
    })
    .select("id,code")
    .single();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    payload.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total: item.unitPrice === null ? null : item.unitPrice * item.quantity,
    })),
  );

  if (itemsError) {
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  if (payload.deliveryAddress) {
    await supabase.from("customer_addresses").insert({
      customer_token: payload.customerToken,
      user_id: userId,
      receiver_name: payload.customerName,
      phone: payload.customerPhone || "",
      address: payload.deliveryAddress,
      neighborhood: payload.deliveryZone,
      notes: payload.deliveryNotes || null,
      zone: payload.deliveryZone,
      is_default: true,
    });
  }

  const { data, error } = await supabase
    .from("orders")
    .select(orderSelect)
    .eq("id", order.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ order: publicOrderFromDb(data as DbOrder) });
}
