# Distribuciones LYM Platform

Plataforma para venta de productos de piscina, gestión administrativa, cotizaciones, remisiones, clientes y pedidos conectados a Supabase.

## Enlaces locales

- Tienda: http://127.0.0.1:3002/
- Ofertas: http://127.0.0.1:3002/ofertas
- Estado del pedido: http://127.0.0.1:3002/estado-pedido
- Nosotros: http://127.0.0.1:3002/nosotros
- Servicios: http://127.0.0.1:3002/servicios
- Contacto: http://127.0.0.1:3002/contacto
- Politicas: http://127.0.0.1:3002/politicas
- Admin: http://127.0.0.1:3002/admin

## Admin

El panel usa sesión protegida y puede validar usuarios con rol `admin` en Supabase.

## Flujo comprador

- Explorar catálogo.
- Filtrar por categoría, disponibilidad, favoritos o productos por cotizar.
- Ver detalle del producto.
- Agregar al carrito.
- Solicitar cotización por WhatsApp o continuar al checkout preparado para Wompi.
- Crear cuenta antes de pagar.
- Consultar estado del pedido.

## Flujo administrador

- Entrar al panel admin.
- Editar productos, fotos, stock y precio.
- Crear ofertas.
- Gestionar pedidos.
- Asignar domicilios.
- Generar remisiones.
- Exportar inventario CSV.
- Recargar datos desde Supabase.

## Pendiente para producción

- Subida real de imágenes a Storage.
- Activar llaves reales de Wompi.
- Notificaciones WhatsApp/API.
