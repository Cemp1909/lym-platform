# Seguridad - Distribuciones LYM

## Estado actual

- Variables sensibles fuera del codigo fuente mediante `.env.local`.
- CORS aplicado a `/api/*` con `ALLOWED_ORIGINS`.
- Rate limiting aplicado a `/api/*`.
- Sanitizacion de inputs en tienda, admin, estado de pedido y CSV.
- Cabeceras HTTP de seguridad configuradas en `next.config.ts`.
- `/admin` protegido por `proxy.ts` y cookie `HttpOnly`.
- `/admin` marcado como `noindex, nofollow, noarchive`.
- RLS preparado en Supabase para clientes y rol `admin`.
- `npm audit --audit-level=moderate` sin vulnerabilidades.

## Variables obligatorias en produccion

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=https://distribucioneslym.com
ALLOWED_ORIGINS=https://distribucioneslym.com,https://www.distribucioneslym.com
RATE_LIMIT_REQUESTS_PER_MINUTE=120
RATE_LIMIT_WINDOW_MS=60000
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
```

`ADMIN_PASSWORD` y `ADMIN_SESSION_SECRET` deben ser valores largos, unicos y
privados. `SUPABASE_SERVICE_ROLE_KEY` nunca debe usarse en componentes cliente.

## Checklist antes de entregar

1. Configurar las variables de entorno en Vercel o el proveedor elegido.
2. Ejecutar `supabase/schema.sql` y luego `supabase/rls-user-data.sql`.
3. Crear al menos un usuario administrador en Supabase Auth.
4. En `profiles`, poner `role = 'admin'` al usuario administrador.
5. Probar `/admin`: sin sesion debe redirigir a `/admin/login`.
6. Probar cierre de sesion del admin.
7. Verificar que clientes solo vean sus propios pedidos/direcciones.
8. Verificar HTTPS y certificado en el dominio final.
9. Revisar cabeceras con una herramienta externa como SecurityHeaders.com.
10. Probar Wompi en sandbox antes de activar produccion.

## Pendiente cuando se conecte Supabase Auth completo

El acceso temporal de `/admin/login` debe reemplazarse por validacion de sesion
Supabase y rol `admin` desde `profiles`. La cookie actual es suficiente para una
entrega controlada, pero el modelo final debe centralizar usuarios y roles en
Supabase Auth.
