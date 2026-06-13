import { NextResponse } from "next/server";

const sessionCookieName = "lym_admin_session";
const maxAge = 60 * 60 * 8;

function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/admin",
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
  } | null;

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
  response.headers.set("Cache-Control", "no-store");

  return response;
}
