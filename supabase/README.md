# Supabase - Distribuciones LYM

## Orden recomendado

1. Crear proyecto en Supabase.
2. Copiar `.env.example` a `.env.local`.
3. Pegar:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
   - `ALLOWED_ORIGINS`
   - `RATE_LIMIT_REQUESTS_PER_MINUTE`
   - `RATE_LIMIT_WINDOW_MS`
   - `ADMIN_PASSWORD`
   - `ADMIN_SESSION_SECRET`
4. Abrir Supabase SQL Editor y ejecutar `supabase/schema.sql`.
5. Crear bucket de Storage:
   - `product-images`
   - público para lectura.
6. Después conectar módulos en este orden:
   - Productos
   - Ofertas
   - Login/clientes
   - Pedidos
   - Domicilios
   - Wompi

## Nota de seguridad

`SUPABASE_SERVICE_ROLE_KEY` solo se usa en servidor. Nunca debe importarse en
componentes `"use client"`.

## CORS

Las rutas propias del backend en Next (`/api/*`) quedan protegidas por `proxy.ts`.
Solo aceptan peticiones de los dominios definidos en `ALLOWED_ORIGINS`.

Para desarrollo local puedes usar:

```bash
ALLOWED_ORIGINS=http://127.0.0.1:3002,http://localhost:3002
```

Para produccion usa el dominio real:

```bash
ALLOWED_ORIGINS=https://distribucioneslym.com,https://www.distribucioneslym.com
```

CORS solo bloquea navegadores. La seguridad de datos en Supabase depende de RLS,
politicas por usuario y de no exponer `SUPABASE_SERVICE_ROLE_KEY` al cliente.

## Rate limiting

`proxy.ts` tambien limita peticiones a `/api/*` para reducir abuso:

```bash
RATE_LIMIT_REQUESTS_PER_MINUTE=120
RATE_LIMIT_AUTH_REQUESTS_PER_MINUTE=12
RATE_LIMIT_ADMIN_REQUESTS_PER_MINUTE=180
RATE_LIMIT_WINDOW_MS=60000
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

El limite se aplica por usuario cuando la peticion trae token de Supabase, por
sesion de admin cuando aplica, y por IP para endpoints publicos. En Vercel, para
que el conteo sea global entre instancias, configura `UPSTASH_REDIS_REST_URL` y
`UPSTASH_REDIS_REST_TOKEN`. Si no existen, el sistema usa memoria local como
respaldo.

## Admin

El panel `/admin` esta protegido por `proxy.ts`. Para entrar se usa
`/admin/login`, que valida `ADMIN_PASSWORD` y crea una cookie `HttpOnly` llamada
`lym_admin_session`.

Configura en produccion:

```bash
ADMIN_PASSWORD=una-clave-larga-unica
ADMIN_SESSION_SECRET=token-largo-aleatorio-minimo-32-caracteres
```

Cuando Supabase Auth quede conectado, este acceso debe reemplazarse por rol
`admin` desde la tabla `profiles`.
