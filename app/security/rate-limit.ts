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
    };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetAt: current.resetAt,
      retryAfter: Math.ceil((current.resetAt - now) / 1000),
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
  };
}

export function checkRequestRateLimit(
  request: NextRequest,
  options: RateLimitOptions = {},
) {
  const identifier = options.userId
    ? `user:${options.userId}`
    : `ip:${getClientIp(request)}`;

  return checkRateLimit(identifier, options);
}

export function applyRateLimitHeaders(response: Response, result: RateLimitResult) {
  response.headers.set("X-RateLimit-Limit", String(result.limit));
  response.headers.set("X-RateLimit-Remaining", String(result.remaining));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));

  if (!result.allowed) {
    response.headers.set("Retry-After", String(result.retryAfter));
  }

  return response;
}
