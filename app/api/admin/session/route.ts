import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/app/supabase/admin";

const sessionCookieName = "lym_admin_session";
const maxAge = 60 * 60 * 8;

function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge,
  };
}

export async function POST(request: Request) {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!adminUsername || !adminPassword || !sessionSecret) {
    return NextResponse.json(
      {
        error:
          "Falta configurar ADMIN_USERNAME, ADMIN_PASSWORD o ADMIN_SESSION_SECRET.",
      },
      { status: 500 },
    );
  }

  const body = (await request.json().catch(() => null)) as {
    username?: string;
    password?: string;
    accessToken?: string;
  } | null;

  if (body?.accessToken) {
    const supabase = createSupabaseAdminClient();
    const { data: userData, error: userError } = await supabase.auth.getUser(
      body.accessToken,
    );

    if (userError || !userData.user) {
      return NextResponse.json(
        { error: "Sesión de Supabase inválida." },
        { status: 401 },
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userData.user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json(
        { error: "Este usuario no tiene rol de administrador." },
        { status: 403 },
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(sessionCookieName, sessionSecret, adminCookieOptions());
    response.headers.set("Cache-Control", "no-store");

    return response;
  }

  const username = body?.username?.trim();

  if (
    username?.toLowerCase() !== adminUsername.toLowerCase() ||
    !body?.password ||
    body.password !== adminPassword
  ) {
    return NextResponse.json(
      { error: "Usuario o clave de administrador incorrectos." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieName, sessionSecret, adminCookieOptions());
  response.headers.set("Cache-Control", "no-store");

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(sessionCookieName, "", {
    ...adminCookieOptions(),
    maxAge: 0,
  });
  response.cookies.set(sessionCookieName, "", {
    ...adminCookieOptions(),
    path: "/admin",
    maxAge: 0,
  });
  response.headers.set("Cache-Control", "no-store");

  return response;
}
