-- Permisos necesarios para que el backend de Next use SUPABASE_SERVICE_ROLE_KEY.
-- Ejecutar en Supabase SQL Editor.

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
