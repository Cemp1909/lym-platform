# Distribuciones LYM Platform

Plataforma demo para venta de productos de piscina, gestión administrativa, cotizaciones, remisiones y flujo visual de pago Wompi.

## Enlaces locales

- Tienda: http://127.0.0.1:3002/
- Ofertas: http://127.0.0.1:3002/ofertas
- Estado del pedido: http://127.0.0.1:3002/estado-pedido
- Nosotros: http://127.0.0.1:3002/nosotros
- Servicios: http://127.0.0.1:3002/servicios
- Contacto: http://127.0.0.1:3002/contacto
- Politicas: http://127.0.0.1:3002/politicas
- Admin: http://127.0.0.1:3002/admin

## Admin demo

Clave visual: `admin`

Esta clave no es seguridad real. Antes de producción debe conectarse con Supabase Auth o un sistema equivalente.

## Flujo comprador

- Explorar catálogo.
- Filtrar por categoría, disponibilidad, favoritos o productos por cotizar.
- Ver detalle del producto.
- Agregar al carrito.
- Solicitar cotización por WhatsApp o continuar al demo de Wompi.
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
- Restaurar datos demo.

## Pendiente para producción

- Base de datos de productos, clientes, pedidos, favoritos y ofertas.
- Subida real de imágenes a Storage.
- Autenticación real para clientes y administradores.
- Integración real con Wompi.
- Notificaciones WhatsApp/API.
- Reglas de seguridad y permisos por rol.
