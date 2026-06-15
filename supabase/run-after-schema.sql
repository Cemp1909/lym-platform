-- Ejecutar en Supabase SQL Editor después de `supabase/schema.sql`.
-- Habilita el backend de Next para productos, ofertas, pedidos, domicilios y remisiones.

grant usage on schema public to service_role;

grant select, insert, update, delete on public.products to service_role;
grant select, insert, update, delete on public.offers to service_role;
grant select, insert, update, delete on public.orders to service_role;
grant select, insert, update, delete on public.order_items to service_role;
grant select, insert, update, delete on public.delivery_assignments to service_role;
grant select, insert, update, delete on public.customer_addresses to service_role;
grant select, insert, update, delete on public.profiles to service_role;
grant select, insert, update, delete on public.audit_log to service_role;
grant usage, select, update on all sequences in schema public to service_role;

alter table public.customer_addresses
  alter column user_id drop not null;

alter table public.customer_addresses
  add column if not exists customer_token text;

alter table public.orders
  add column if not exists customer_token text,
  add column if not exists customer_email text,
  add column if not exists delivery_notes text,
  add column if not exists payment_method text;

create index if not exists orders_customer_token_idx
  on public.orders (customer_token);

create index if not exists customer_addresses_customer_token_idx
  on public.customer_addresses (customer_token);
