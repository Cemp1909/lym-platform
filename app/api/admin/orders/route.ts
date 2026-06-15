import { NextResponse } from "next/server";
import { requireAdminSession } from "@/app/api/admin/_lib/auth";
import {
  orderFromDb,
  statusToDb,
  type DbOrder,
} from "@/app/data/order-mappers";
import {
  sanitizeLongText,
  sanitizeMoneyLike,
  sanitizeOrderCode,
  sanitizeText,
} from "@/app/security/sanitize";
import { createSupabaseAdminClient } from "@/app/supabase/admin";

const orderSelect = `
  id,
  code,
  customer_name,
  customer_phone,
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

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(orderSelect)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    orders: ((data ?? []) as DbOrder[]).map(orderFromDb),
  });
}

export async function PATCH(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const payload = (await request.json()) as {
    code: string;
    status?: string;
    delivery?: {
      zone: string;
      address: string;
      cost: string;
      courier: string;
      window: string;
      notes: string;
    };
  };
  const code = sanitizeOrderCode(payload.code);

  if (!code) {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: order, error: orderFindError } = await supabase
    .from("orders")
    .select("id")
    .eq("code", code)
    .single();

  if (orderFindError) {
    return NextResponse.json({ error: orderFindError.message }, { status: 500 });
  }

  const updates: Record<string, string | number | null> = {};

  if (payload.status) {
    updates.status = statusToDb(payload.status);
  }

  if (payload.delivery) {
    const cost = Number(sanitizeMoneyLike(payload.delivery.cost).replace(/[^\d]/g, ""));
    updates.status = "in_delivery";
    updates.delivery_zone = sanitizeText(payload.delivery.zone, { maxLength: 80 });
    updates.delivery_address = sanitizeText(payload.delivery.address, {
      maxLength: 180,
    });
    updates.delivery_cost = Number.isFinite(cost) ? cost : 0;
    updates.delivery_notes = sanitizeLongText(payload.delivery.notes, 300);

    const { error: deliveryError } = await supabase
      .from("delivery_assignments")
      .insert({
        order_id: order.id,
        courier_name:
          sanitizeText(payload.delivery.courier, { maxLength: 80 }) ||
          "Equipo LYM",
        cost: updates.delivery_cost,
        delivery_window: sanitizeText(payload.delivery.window, {
          maxLength: 80,
        }),
        notes: updates.delivery_notes,
        sent_to_customer: false,
      });

    if (deliveryError) {
      return NextResponse.json(
        { error: deliveryError.message },
        { status: 500 },
      );
    }
  }

  if (Object.keys(updates).length) {
    updates.updated_at = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", order.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
  }

  const { data, error } = await supabase
    .from("orders")
    .select(orderSelect)
    .eq("id", order.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ order: orderFromDb(data as DbOrder) });
}
