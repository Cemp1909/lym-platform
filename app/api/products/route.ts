import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/app/supabase/admin";
import { productFromDb } from "@/app/data/product-mappers";

export async function GET() {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      "id,name,category,price,unit,stock,availability,tag,image_url,status,featured",
    )
    .in("status", ["published", "offer_active", "on_request"])
    .order("id", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    products: (data ?? []).map(productFromDb),
  });
}
