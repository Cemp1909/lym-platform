-- Distribuciones LYM - usuarios reales y administrador por rol.
-- Ejecutar en Supabase SQL Editor.

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.profiles to service_role;
grant select, insert, update, delete on public.orders to service_role;
grant select, insert, update, delete on public.order_items to service_role;
grant select, insert, update, delete on public.customer_addresses to service_role;

drop policy if exists "Cliente crea su perfil" on public.profiles;
drop policy if exists "Cliente actualiza su perfil" on public.profiles;

create policy "Cliente crea su perfil"
on public.profiles for insert
with check (auth.uid() = id);

create policy "Cliente actualiza su perfil"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- Para convertir un usuario real en administrador:
-- 1. Crea el usuario desde la tienda o desde Authentication > Users.
-- 2. Cambia el correo de abajo por el correo real del admin.
-- 3. Ejecuta este bloque.
--
-- insert into public.profiles (id, full_name, email, phone, role)
-- select
--   id,
--   coalesce(raw_user_meta_data->>'full_name', email),
--   email,
--   coalesce(raw_user_meta_data->>'phone', ''),
--   'admin'
-- from auth.users
-- where email = 'correo-admin@empresa.com'
-- on conflict (id) do update
-- set role = 'admin', updated_at = now();
