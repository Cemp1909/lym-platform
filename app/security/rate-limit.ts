import type { NextRequest } from "next/server";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  keyPrefix?: string;
  limit?: number;
  windowMs?: number;
  userId?: string | null;
};

type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfter: number;
  key: string;
  storage: "memory" | "redis";
};

declare global {
  var __lymRateLimitStore: Map<string, RateLimitEntry> | undefined;
}

const store = globalThis.__lymRateLimitStore ?? new Map<string, RateLimitEntry>();
globalThis.__lymRateLimitStore = store;

const defaultLimit = 120;
const defaultWindowMs = 60_000;

function readPositiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0];
  const realIp = request.headers.get("x-real-ip");
  const vercelIp = request.headers.get("x-vercel-forwarded-for")?.split(",")[0];
  const cloudflareIp = request.headers.get("cf-connecting-ip");

  return (
    forwardedFor?.trim() ||
    vercelIp?.trim() ||
    realIp?.trim() ||
    cloudflareIp?.trim() ||
    "unknown"
  );
}

export function checkRateLimit(
  identifier: string,
  options: Omit<RateLimitOptions, "userId"> = {},
): RateLimitResult {
  const now = Date.now();
  const limit =
    options.limit ??
    readPositiveNumber(process.env.RATE_LIMIT_REQUESTS_PER_MINUTE, defaultLimit);
  const windowMs =
    options.windowMs ??
    readPositiveNumber(process.env.RATE_LIMIT_WINDOW_MS, defaultWindowMs);
  const key = `${options.keyPrefix ?? "api"}:${identifier}`;
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });

    return {
      allowed: true,
      limit,
      remaining: Math.max(limit - 1, 0),
      resetAt: now + windowMs,
      retryAfter: 0,
      key,
      storage: "memory",
    };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt: current.resetAt,
      retryAfter: Math.ceil((current.resetAt - now) / 1000),
      key,
      storage: "memory",
    };
  }

  current.count += 1;
  store.set(key, current);

  return {
    allowed: true,
    limit,
    remaining: Math.max(limit - current.count, 0),
    resetAt: current.resetAt,
    retryAfter: 0,
    key,
    storage: "memory",
  };
}

function getRateLimitIdentity(request: NextRequest, userId?: string | null) {
  if (userId) return `user:${userId}`;

  const tokenSubject = getJwtSubject(
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "",
  );

  if (tokenSubject) return `user:${tokenSubject}`;

  const adminSession = request.cookies.get("lym_admin_session")?.value;
  const adminSecret = process.env.ADMIN_SESSION_SECRET;

  if (adminSession && adminSecret && adminSession === adminSecret) {
    return "admin:session";
  }

  return `ip:${getClientIp(request)}`;
}

function getRequestLimitOptions(request: NextRequest, options: RateLimitOptions) {
  const pathname = request.nextUrl.pathname;
  const isAuthRoute =
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/admin/session");
  const isAdminRoute = pathname.startsWith("/api/admin/");
  const defaultRouteLimit = isAuthRoute
    ? 12
    : isAdminRoute
      ? 180
      : defaultLimit;
  const envName = isAuthRoute
    ? "RATE_LIMIT_AUTH_REQUESTS_PER_MINUTE"
    : isAdminRoute
      ? "RATE_LIMIT_ADMIN_REQUESTS_PER_MINUTE"
      : "RATE_LIMIT_REQUESTS_PER_MINUTE";

  return {
    limit: options.limit ?? readPositiveNumber(process.env[envName], defaultRouteLimit),
    windowMs:
      options.windowMs ??
      readPositiveNumber(process.env.RATE_LIMIT_WINDOW_MS, defaultWindowMs),
    keyPrefix:
      options.keyPrefix ??
      (isAuthRoute ? "auth" : isAdminRoute ? "admin-api" : "api"),
  };
}

export async function checkRequestRateLimit(
  request: NextRequest,
  options: RateLimitOptions = {},
) {
  const identifier = getRateLimitIdentity(request, options.userId);
  const routeOptions = getRequestLimitOptions(request, options);
  const redisResult = await checkRedisRateLimit(identifier, routeOptions);

  return redisResult ?? checkRateLimit(identifier, routeOptions);
}

export function applyRateLimitHeaders(response: Response, result: RateLimitResult) {
  response.headers.set("X-RateLimit-Limit", String(result.limit));
  response.headers.set("X-RateLimit-Remaining", String(result.remaining));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));
  response.headers.set("X-RateLimit-Storage", result.storage);

  if (!result.allowed) {
    response.headers.set("Retry-After", String(result.retryAfter));
  }

  return response;
}

async function checkRedisRateLimit(
  identifier: string,
  options: Required<Pick<RateLimitOptions, "limit" | "windowMs" | "keyPrefix">>,
): Promise<RateLimitResult | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  const now = Date.now();
  const safeKey = encodeURIComponent(`lym:${options.keyPrefix}:${identifier}`);

  try {
    const count = Number(
      await upstashCommand<number>(url, token, ["INCR", safeKey]),
    );

    if (count === 1) {
      await upstashCommand(url, token, ["PEXPIRE", safeKey, String(options.windowMs)]);
    }

    const ttl = Number(await upstashCommand<number>(url, token, ["PTTL", safeKey]));
    const remainingTtl = ttl > 0 ? ttl : options.windowMs;
    const resetAt = now + remainingTtl;

    return {
      allowed: count <= options.limit,
      limit: options.limit,
      remaining: Math.max(options.limit - count, 0),
      resetAt,
      retryAfter: count > options.limit ? Math.ceil(remainingTtl / 1000) : 0,
      key: `lym:${options.keyPrefix}:${identifier}`,
      storage: "redis",
    };
  } catch {
    return null;
  }
}

async function upstashCommand<T = unknown>(
  url: string,
  token: string,
  command: string[],
): Promise<T> {
  const response = await fetch(`${url.replace(/\/$/, "")}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    throw new Error("No se pudo consultar Redis para rate limiting.");
  }

  const payload = (await response.json()) as { result: T; error?: string };
  if (payload.error) throw new Error(payload.error);

  return payload.result;
}

function getJwtSubject(token: string) {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    const normalizedPayload = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const decodedPayload = JSON.parse(atob(normalizedPayload)) as {
      sub?: string;
    };

    return decodedPayload.sub || null;
  } catch {
    return null;
  }
}
