declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const fallbackAllowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  "http://localhost:3002",
  "http://127.0.0.1:3002",
  "https://distribucioneslym.com",
  "https://www.distribucioneslym.com",
];

const allowedMethods = "GET,POST,PUT,PATCH,DELETE,OPTIONS";
const allowedHeaders =
  "Accept,Authorization,Content-Type,X-Requested-With,X-CSRF-Token";

function getAllowedOrigins() {
  const envOrigins = Deno.env.get("ALLOWED_ORIGINS")
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return envOrigins?.length ? envOrigins : fallbackAllowedOrigins;
}

export function isAllowedOrigin(origin: string | null) {
  if (!origin) {
    return true;
  }

  return getAllowedOrigins().includes(origin);
}

export function getCorsHeaders(origin: string | null) {
  const headers = new Headers({
    "Access-Control-Allow-Methods": allowedMethods,
    "Access-Control-Allow-Headers": allowedHeaders,
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  });

  if (origin && isAllowedOrigin(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
  }

  return headers;
}

export function handleCors(request: Request) {
  const origin = request.headers.get("origin");

  if (!isAllowedOrigin(origin)) {
    return new Response(JSON.stringify({ error: "Origen no permitido." }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    });
  }

  return null;
}
