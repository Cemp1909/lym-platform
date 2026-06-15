import { NextResponse } from "next/server";
import {
  adminProductFromDb,
  productToDb,
  type AdminProductPayload,
} from "@/app/data/product-mappers";
import { requireAdminSession } from "@/app/api/admin/_lib/auth";
import { createSupabaseAdminClient } from "@/app/supabase/admin";

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id,name,category,price,unit,stock,availability,tag,image_url,status,featured",
    )
    .order("id", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    products: (data ?? []).map(adminProductFromDb),
  });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const payload = (await request.json()) as AdminProductPayload;
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .upsert(productToDb(payload), { onConflict: "id" })
    .select(
      "id,name,category,price,unit,stock,availability,tag,image_url,status,featured",
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ product: adminProductFromDb(data) });
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const payload = (await request.json()) as { products: AdminProductPayload[] };
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .upsert(payload.products.map(productToDb), { onConflict: "id" })
    .select(
      "id,name,category,price,unit,stock,availability,tag,image_url,status,featured",
    )
    .order("id", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ products: (data ?? []).map(adminProductFromDb) });
}

export async function DELETE(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
