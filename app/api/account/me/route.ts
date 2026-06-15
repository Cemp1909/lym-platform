import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/app/supabase/admin";

export async function GET(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: userData, error: userError } = await supabase.auth.getUser(token);

  if (userError || !userData.user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,full_name,email,phone,role")
    .eq("id", userData.user.id)
    .single();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({
    user: {
      id: userData.user.id,
      name: profile?.full_name || userData.user.email?.split("@")[0] || "Cliente",
      email: profile?.email || userData.user.email || "",
      phone: profile?.phone || "",
      role: profile?.role || "customer",
    },
  });
}
