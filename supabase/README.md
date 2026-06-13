# Supabase - Distribuciones LYM

## Orden recomendado

1. Crear proyecto en Supabase.
2. Copiar `.env.example` a `.env.local`.
3. Pegar:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
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
