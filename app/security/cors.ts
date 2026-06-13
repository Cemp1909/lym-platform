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

export function getAllowedOrigins() {
  const origins = process.env.ALLOWED_ORIGINS?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return origins?.length ? origins : fallbackAllowedOrigins;
}

export function isAllowedOrigin(origin: string | null) {
  if (!origin) {
    return true;
  }

  return getAllowedOrigins().includes(origin);
}

export function getCorsHeaders(origin: string | null) {
  const headers = new Headers();

  if (origin && isAllowedOrigin(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
  }

  headers.set("Access-Control-Allow-Methods", allowedMethods);
  headers.set("Access-Control-Allow-Headers", allowedHeaders);
  headers.set("Access-Control-Max-Age", "86400");
  headers.set("Vary", "Origin");

  return headers;
}

export function applyCorsHeaders(response: Response, origin: string | null) {
  getCorsHeaders(origin).forEach((value, key) => {
    response.headers.set(key, value);
  });

  return response;
}
