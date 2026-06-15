import {
  CreditCard,
  FileCheck2,
  PackageCheck,
  RefreshCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import type { Metadata } from "next";
import { InfoFooter, InfoHeader } from "../info-layout";

export const metadata: Metadata = {
  title: "Políticas",
  description:
    "Políticas de entrega, pagos, cambios, disponibilidad y uso de datos para compras en Distribuciones LYM.",
};

const policies = [
  {
    title: "Entregas",
    icon: Truck,
    text: "Las entregas se coordinan por zona y disponibilidad. El valor del domicilio se confirma antes de finalizar el pedido.",
  },
  {
    title: "Pagos",
    icon: CreditCard,
    text: "La tienda está preparada para Wompi. El cobro real se activa al configurar las llaves de producción.",
  },
  {
    title: "Cambios",
    icon: RefreshCcw,
    text: "Los cambios aplican según estado del producto, empaque, referencia y validación del equipo de Distribuciones LYM.",
  },
  {
    title: "Garantías",
    icon: FileCheck2,
    text: "Las garantías se gestionan según la referencia, el proveedor y la revisión técnica. Equipos instalados requieren evidencia de uso e instalación adecuada.",
  },
  {
    title: "Disponibilidad",
    icon: PackageCheck,
    text: "Los productos marcados como por definir requieren confirmación de precio y existencia antes del pago.",
  },
  {
    title: "Datos",
    icon: ShieldCheck,
    text: "Los datos del cliente se usarán para gestionar compras, cotizaciones, entregas y soporte comercial.",
  },
];

export default function PoliticasPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFB] text-[#062A3E]">
      <InfoHeader active="Políticas" />

      <section className="border-b border-[#0A3D5C]/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase text-[#00B4D8]">
            Políticas
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-bold leading-tight">
            Condiciones claras para comprar con confianza.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#617789]">
            Esta página deja preparado el espacio de políticas comerciales antes
            de conectar base de datos, pagos reales y despliegue.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {policies.map((policy) => (
            <article
              key={policy.title}
              className="rounded-lg border border-[#0A3D5C]/10 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-[#EAF8FC] text-[#0084A3]">
                <policy.icon className="size-6" />
              </div>
              <h2 className="font-display text-2xl font-bold">
                {policy.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#617789]">
                {policy.text}
              </p>
            </article>
          ))}
        </div>
        <div className="mt-6 rounded-lg border border-[#0A3D5C]/10 bg-white p-5 shadow-sm">
          <h2 className="font-display text-2xl font-bold">
            Condiciones para cambios y garantías
          </h2>
          <div className="mt-4 grid gap-3 text-sm leading-6 text-[#617789] md:grid-cols-2">
            <p>
              Para solicitar un cambio, el producto debe conservar empaque,
              accesorios y estado apto para revisión. Productos químicos abiertos
              o manipulados pueden requerir validación especial.
            </p>
            <p>
              En equipos, bombas, repuestos eléctricos o accesorios técnicos, la
              garantía depende de diagnóstico, condiciones de instalación y
              políticas del proveedor o fabricante.
            </p>
            <p>
              Los productos comprados por cotización pueden tener tiempos de
              entrega, precios y disponibilidad sujetos a confirmación antes del
              pago.
            </p>
            <p>
              El equipo de Distribuciones LYM acompañará el proceso por
              WhatsApp, correo o atención en punto para dejar trazabilidad clara.
            </p>
          </div>
        </div>
      </section>

      <InfoFooter />
    </main>
  );
}
