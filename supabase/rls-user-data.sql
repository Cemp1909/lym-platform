-- RLS para datos privados de clientes
-- Ejecutar en Supabase SQL Editor.
-- Este script es seguro para correr más de una vez.

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.offers enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.delivery_assignments enable row level security;
alter table public.audit_log enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  );
$$;

grant usage on schema public to anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.offers to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.customer_addresses to authenticated;
grant select, insert, update on public.orders to authenticated;
grant select, insert on public.order_items to authenticated;
grant select on public.delivery_assignments to authenticated;
grant select, insert on public.audit_log to authenticated;
grant usage, select on all sequences in schema public to authenticated;

drop policy if exists "Productos publicados visibles" on public.products;
drop policy if exists "Admin gestiona productos" on public.products;

create policy "Productos publicados visibles"
on public.products for select
using (status in ('published', 'offer_active', 'on_request'));

create policy "Admin gestiona productos"
on public.products for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Ofertas activas visibles" on public.offers;
drop policy if exists "Admin gestiona ofertas" on public.offers;

create policy "Ofertas activas visibles"
on public.offers for select
using (active = true);

create policy "Admin gestiona ofertas"
on public.offers for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Cliente ve su perfil" on public.profiles;
drop policy if exists "Cliente crea su perfil" on public.profiles;
drop policy if exists "Cliente actualiza su perfil" on public.profiles;

create policy "Cliente ve su perfil"
on public.profiles for select
using (auth.uid() = id);

create policy "Cliente crea su perfil"
on public.profiles for insert
with check (auth.uid() = id);

create policy "Cliente actualiza su perfil"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Admin ve perfiles" on public.profiles;
drop policy if exists "Admin actualiza perfiles" on public.profiles;

create policy "Admin ve perfiles"
on public.profiles for select
using (public.is_admin());

create policy "Admin actualiza perfiles"
on public.profiles for update
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Cliente ve sus direcciones" on public.customer_addresses;
drop policy if exists "Cliente crea sus direcciones" on public.customer_addresses;
drop policy if exists "Cliente actualiza sus direcciones" on public.customer_addresses;
drop policy if exists "Cliente elimina sus direcciones" on public.customer_addresses;
drop policy if exists "Cliente gestiona sus direcciones" on public.customer_addresses;

create policy "Cliente ve sus direcciones"
on public.customer_addresses for select
using (auth.uid() = user_id);

create policy "Cliente crea sus direcciones"
on public.customer_addresses for insert
with check (auth.uid() = user_id);

create policy "Cliente actualiza sus direcciones"
on public.customer_addresses for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Cliente elimina sus direcciones"
on public.customer_addresses for delete
using (auth.uid() = user_id);

drop policy if exists "Cliente ve sus pedidos" on public.orders;
drop policy if exists "Cliente crea sus pedidos" on public.orders;
drop policy if exists "Cliente actualiza pedidos propios" on public.orders;

create policy "Cliente ve sus pedidos"
on public.orders for select
using (auth.uid() = user_id);

create policy "Cliente crea sus pedidos"
on public.orders for insert
with check (auth.uid() = user_id);

create policy "Cliente actualiza pedidos propios"
on public.orders for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Admin gestiona pedidos" on public.orders;

create policy "Admin gestiona pedidos"
on public.orders for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Cliente ve items de sus pedidos" on public.order_items;
drop policy if exists "Cliente crea items de sus pedidos" on public.order_items;

create policy "Cliente ve items de sus pedidos"
on public.order_items for select
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
    and orders.user_id = auth.uid()
  )
);

create policy "Cliente crea items de sus pedidos"
on public.order_items for insert
with check (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
    and orders.user_id = auth.uid()
  )
);

drop policy if exists "Admin gestiona items de pedidos" on public.order_items;

create policy "Admin gestiona items de pedidos"
on public.order_items for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Cliente ve domicilio de sus pedidos" on public.delivery_assignments;

create policy "Cliente ve domicilio de sus pedidos"
on public.delivery_assignments for select
using (
  exists (
    select 1
    from public.orders
    where orders.id = delivery_assignments.order_id
    and orders.user_id = auth.uid()
  )
);

drop policy if exists "Admin gestiona domicilios" on public.delivery_assignments;

create policy "Admin gestiona domicilios"
on public.delivery_assignments for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Cliente ve su auditoria" on public.audit_log;
drop policy if exists "Cliente crea auditoria propia" on public.audit_log;

create policy "Cliente ve su auditoria"
on public.audit_log for select
using (auth.uid() = actor_id);

create policy "Cliente crea auditoria propia"
on public.audit_log for insert
with check (auth.uid() = actor_id);

drop policy if exists "Admin ve auditoria" on public.audit_log;
drop policy if exists "Admin crea auditoria" on public.audit_log;

create policy "Admin ve auditoria"
on public.audit_log for select
using (public.is_admin());

create policy "Admin crea auditoria"
on public.audit_log for insert
with check (public.is_admin());
