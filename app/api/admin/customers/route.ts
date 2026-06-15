import { NextResponse } from "next/server";
import { requireAdminSession } from "@/app/api/admin/_lib/auth";
import { createSupabaseAdminClient } from "@/app/supabase/admin";

export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id,full_name,email,phone,role,created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ customers: data ?? [] });
}
