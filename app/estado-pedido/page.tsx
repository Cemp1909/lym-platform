"use client";

import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Download,
  MapPin,
  MessageCircle,
  PackageCheck,
  ReceiptText,
  Share2,
  ShoppingCart,
  Truck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { InfoFooter, InfoHeader } from "../info-layout";
import { whatsappMessages, whatsappUrl } from "../whatsapp";

type OrderLine = {
  name: string;
  quantity: number;
  price: string;
};

type DemoOrder = {
  id: string;
  client: string;
  date: string;
  total: string;
  payment: string;
  delivery: string;
  address: string;
  phone: string;
  courier: string;
  eta: string;
  status: string;
  activeStep: number;
  lines: OrderLine[];
};

const steps = [
  ["Pedido recibido", "Solicitud registrada por la tienda"],
  ["Pago confirmado", "Pago o cotización validada"],
  ["Preparando", "Productos en alistamiento"],
  ["En domicilio", "Ruta o recogida asignada"],
  ["Entregado", "Pedido finalizado"],
];

const demoOrders: Record<string, DemoOrder> = {
  "LYM-1048": {
    id: "LYM-1048",
    client: "Conjunto Reserva del Llano",
    date: "11 junio 2026",
    total: "Por confirmar",
    payment: "Pago pendiente con Wompi demo",
    delivery: "Domicilio local",
    address: "Cra 22 #18-40, Torre 3, Villavicencio",
    phone: "310 555 1948",
    courier: "Sin asignar todavía",
    eta: "Hoy, 4:00 p.m. - 6:00 p.m.",
    status: "Preparando pedido",
    activeStep: 2,
    lines: [
      { name: "Cloro granulado al 70%", quantity: 2, price: "$68.000" },
      { name: "Clarificador para piscina", quantity: 1, price: "$28.000" },
      { name: "Test kit pH y cloro", quantity: 1, price: "$45.000" },
      { name: "Cepillo curvo piscina", quantity: 1, price: "$36.000" },
    ],
  },
  "LYM-1047": {
    id: "LYM-1047",
    client: "Hotel Campestre Azul",
    date: "10 junio 2026",
    total: "Por confirmar",
    payment: "Cotización aprobada",
    delivery: "Recoger en punto",
    address: "Punto físico Distribuciones LYM",
    phone: "318 400 2201",
    courier: "Equipo de mostrador",
    eta: "Listo para recoger",
    status: "Preparando para entrega",
    activeStep: 2,
    lines: [
      { name: "Tabletas de cloro", quantity: 6, price: "$72.000" },
      { name: "Alguicida mantenimiento", quantity: 3, price: "$31.000" },
      { name: "Red recogehojas", quantity: 2, price: "$42.000" },
    ],
  },
  "LYM-1046": {
    id: "LYM-1046",
    client: "Casa Quinta Apiay",
    date: "9 junio 2026",
    total: "Por confirmar",
    payment: "Pago confirmado",
    delivery: "Domicilio local",
    address: "Barrio Barzal, casa 18, Villavicencio",
    phone: "301 760 8891",
    courier: "Domiciliario LYM",
    eta: "En ruta",
    status: "En domicilio",
    activeStep: 3,
    lines: [
      { name: "Bomba para piscina", quantity: 1, price: "$390.000" },
      { name: "Arena sílica filtrante", quantity: 2, price: "$52.000" },
    ],
  },
};

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

function EstadoPedidoContent() {
  const params = useSearchParams();
  const initialCode = normalizeCode(params.get("pedido") || "LYM-1048");
  const [orderCode, setOrderCode] = useState(initialCode);
  const [submittedCode, setSubmittedCode] = useState(initialCode);
  const order = demoOrders[normalizeCode(submittedCode)];
  const orderWhatsAppUrl = whatsappUrl(whatsappMessages.order(submittedCode));

  function consultOrder() {
    setSubmittedCode(normalizeCode(orderCode));
  }

  function shareTracking() {
    const url = `${window.location.origin}/estado-pedido?pedido=${submittedCode}`;

    if (navigator.share) {
      navigator.share({
        title: `Seguimiento ${submittedCode}`,
        url,
      });
      return;
    }

    navigator.clipboard.writeText(url);
    window.alert("Enlace de seguimiento copiado.");
  }

  return (
    <main className="min-h-screen bg-[#F8FAFB] text-[#062A3E]">
      <InfoHeader active="Estado" />

      <section className="border-b border-[#0A3D5C]/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase text-[#00B4D8]">
            Estado del pedido
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-bold leading-tight">
            Sigue tu compra paso a paso.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#617789]">
            Vista demo con la misma información que verá el cliente cuando
            conectemos base de datos, pagos y actualizaciones del administrador.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-[#0A3D5C]/10 bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <label className="flex h-12 items-center gap-3 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3">
              <ClipboardList className="size-5 text-[#617789]" />
              <input
                value={orderCode}
                onChange={(event) => setOrderCode(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") consultOrder();
                }}
                placeholder="Ej. LYM-1048"
                className="h-full w-full bg-transparent text-sm font-bold uppercase outline-none"
              />
            </label>
            <button
              onClick={consultOrder}
              className="h-12 rounded-lg bg-[#FF6B35] px-5 text-sm font-bold text-white"
            >
              Consultar
            </button>
          </div>

          {!order ? (
            <div className="mt-5 rounded-lg border border-[#FFD4C4] bg-[#FFF4EF] p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-1 size-6 shrink-0 text-[#FF6B35]" />
                <div>
                  <h2 className="font-display text-2xl font-bold">
                    No encontramos ese pedido
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#617789]">
                    Revisa el código o escríbenos por WhatsApp para que el
                    equipo confirme la información.
                  </p>
                  <a
                    href={orderWhatsAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-[#0A3D5C] px-4 text-sm font-bold text-white"
                  >
                    <MessageCircle className="size-4" />
                    Consultar por WhatsApp
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_360px]">
              <div className="space-y-4">
                <div className="rounded-lg bg-[#F8FAFB] p-4">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <p className="text-xs font-bold uppercase text-[#00B4D8]">
                        Resumen
                      </p>
                      <h2 className="font-display text-3xl font-bold">
                        {order.id}
                      </h2>
                      <p className="mt-1 text-sm text-[#617789]">
                        Estado actual:{" "}
                        <span className="font-bold text-[#0A3D5C]">
                          {order.status}
                        </span>
                      </p>
                    </div>
                    <div className="flex size-12 items-center justify-center rounded-lg bg-[#EAF8FC] text-[#0084A3]">
                      <PackageCheck className="size-6" />
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      [UserRound, "Cliente", order.client],
                      [CalendarClock, "Fecha", order.date],
                      [CreditCard, "Pago", order.payment],
                      [Truck, "Entrega", order.delivery],
                    ].map(([Icon, label, value]) => (
                      <div key={label as string} className="rounded-lg bg-white p-3">
                        <Icon className="size-5 text-[#00B4D8]" />
                        <p className="mt-2 text-xs font-bold uppercase text-[#617789]">
                          {label as string}
                        </p>
                        <p className="mt-1 text-sm font-bold text-[#0A3D5C]">
                          {value as string}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-[#0A3D5C]/10 bg-white p-4">
                  <h3 className="font-display text-xl font-bold">
                    Línea de tiempo
                  </h3>
                  <div className="mt-4 grid gap-3">
                    {steps.map(([title, helper], index) => (
                      <div
                        key={title}
                        className={`flex items-center gap-3 rounded-lg border p-3 ${
                          index <= order.activeStep
                            ? "border-[#BDEFD7] bg-[#EDFFF5]"
                            : "border-[#0A3D5C]/10 bg-[#F8FAFB]"
                        }`}
                      >
                        <div
                          className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                            index <= order.activeStep
                              ? "bg-[#116A3C] text-white"
                              : "bg-white text-[#617789]"
                          }`}
                        >
                          {index <= order.activeStep ? (
                            <CheckCircle2 className="size-5" />
                          ) : (
                            <Truck className="size-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold">{title}</p>
                          <p className="text-sm text-[#617789]">{helper}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-[#0A3D5C]/10 bg-white p-4">
                  <h3 className="font-display text-xl font-bold">
                    Productos del pedido
                  </h3>
                  <div className="mt-4 overflow-hidden rounded-lg border border-[#0A3D5C]/10">
                    {order.lines.map((line) => (
                      <div
                        key={line.name}
                        className="grid gap-2 border-b border-[#0A3D5C]/10 p-3 last:border-b-0 sm:grid-cols-[1fr_80px_110px]"
                      >
                        <p className="font-bold">{line.name}</p>
                        <p className="text-sm text-[#617789]">
                          Cant. {line.quantity}
                        </p>
                        <p className="text-sm font-bold text-[#FF6B35]">
                          {line.price}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="space-y-4">
                <div className="rounded-lg border border-[#0A3D5C]/10 bg-white p-4 shadow-sm">
                  <h3 className="font-display text-xl font-bold">
                    Datos de entrega
                  </h3>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="rounded-lg bg-[#F8FAFB] p-3">
                      <MapPin className="size-5 text-[#00B4D8]" />
                      <p className="mt-2 font-bold text-[#0A3D5C]">
                        {order.address}
                      </p>
                    </div>
                    <p>
                      <span className="font-bold">Teléfono:</span> {order.phone}
                    </p>
                    <p>
                      <span className="font-bold">Domiciliario:</span>{" "}
                      {order.courier}
                    </p>
                    <p>
                      <span className="font-bold">Hora estimada:</span>{" "}
                      {order.eta}
                    </p>
                    <p>
                      <span className="font-bold">Total:</span> {order.total}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-[#0A3D5C]/10 bg-[#F8FAFB] p-4">
                  <h3 className="font-display text-xl font-bold">Acciones</h3>
                  <div className="mt-4 grid gap-2">
                    <a
                      href={orderWhatsAppUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#0A3D5C] text-sm font-bold text-white"
                    >
                      <MessageCircle className="size-4" />
                      Escribir por WhatsApp
                    </a>
                    <Link
                      href={`/cotizacion/${order.id}`}
                      className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#0A3D5C]/12 bg-white text-sm font-bold text-[#0A3D5C]"
                    >
                      <ReceiptText className="size-4" />
                      Ver remisión
                    </Link>
                    <button
                      onClick={() => window.print()}
                      className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#0A3D5C]/12 bg-white text-sm font-bold text-[#0A3D5C]"
                    >
                      <Download className="size-4" />
                      Descargar seguimiento
                    </button>
                    <button
                      onClick={shareTracking}
                      className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#0A3D5C]/12 bg-white text-sm font-bold text-[#0A3D5C]"
                    >
                      <Share2 className="size-4" />
                      Compartir seguimiento
                    </button>
                    <Link
                      href="/#catalogo"
                      className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#0A3D5C]/12 bg-white text-sm font-bold text-[#0A3D5C]"
                    >
                      <ShoppingCart className="size-4" />
                      Volver a comprar
                    </Link>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>

      <InfoFooter />
    </main>
  );
}

export default function EstadoPedidoPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#F8FAFB] text-[#062A3E]">
          <InfoHeader active="Estado" />
          <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-[#617789]">
            Cargando seguimiento...
          </div>
          <InfoFooter />
        </main>
      }
    >
      <EstadoPedidoContent />
    </Suspense>
  );
}
