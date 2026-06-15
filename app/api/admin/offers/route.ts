import { NextResponse } from "next/server";
import { requireAdminSession } from "@/app/api/admin/_lib/auth";
import { createSupabaseAdminClient } from "@/app/supabase/admin";

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("offers")
    .select("id,title,target,discount,active")
    .order("id", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ offers: data ?? [] });
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const payload = (await request.json()) as {
    id?: number;
    title: string;
    target: string;
    discount: string;
    active: boolean;
  };
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("offers")
    .upsert(payload, { onConflict: "id" })
    .select("id,title,target,discount,active")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ offer: data });
}
