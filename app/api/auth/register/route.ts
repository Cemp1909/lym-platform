import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/app/supabase/admin";
import { sanitizeEmail, sanitizePhone, sanitizeText } from "@/app/security/sanitize";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
  } | null;

  const email = sanitizeEmail(body?.email || "");
  const password = body?.password || "";
  const fullName =
    sanitizeText(body?.name || "", { maxLength: 90 }) || "Cliente LYM";
  const phone = sanitizePhone(body?.phone || "");

  if (!email || password.length < 6) {
    return NextResponse.json(
      { error: "Ingresa un correo válido y una contraseña de mínimo 6 caracteres." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();
  const { data: createdUser, error: createError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone,
      },
    });

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 });
  }

  const userId = createdUser.user?.id;

  if (!userId) {
    return NextResponse.json(
      { error: "No se pudo crear el usuario." },
      { status: 500 },
    );
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: userId,
      full_name: fullName,
      email,
      phone,
      role: "customer",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({
    user: {
      id: userId,
      name: fullName,
      email,
      phone,
      role: "customer",
    },
  });
}
