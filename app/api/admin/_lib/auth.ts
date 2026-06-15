import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function requireAdminSession() {
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("lym_admin_session")?.value;

  if (!sessionSecret || !sessionCookie || sessionCookie !== sessionSecret) {
    return NextResponse.json(
      { error: "No autorizado para administrar la tienda." },
      { status: 401 },
    );
  }

  return null;
}
