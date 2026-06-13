import { Clock, MapPin, PackageCheck, Truck } from "lucide-react";
import type { Metadata } from "next";
import { contactInfo } from "../contact-info";
import { InfoFooter, InfoHeader } from "../info-layout";

export const metadata: Metadata = {
  title: "Domicilios",
  description:
    "Zonas, tiempos y condiciones de entrega de Distribuciones LYM para productos de piscina.",
};

const zones = [
  ["Recoger en punto", "$0", "Disponible en horario comercial"],
  ["Villavicencio centro", "$6.000", "Entrega local coordinada"],
  ["Villavicencio norte/sur", "$9.000", "Entrega local coordinada"],
  ["Acacías / Restrepo", "Consultar", "Según ruta y volumen"],
];

export default function DomiciliosPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFB] text-[#062A3E]">
      <InfoHeader active="Domicilios" />

      <section className="border-b border-[#0A3D5C]/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase text-[#00B4D8]">
            Domicilios
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-bold leading-tight">
            Entrega local clara antes de pagar.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#617789]">
            El cliente puede elegir recogida o domicilio. El costo se confirma
            según zona, disponibilidad de ruta y volumen del pedido.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8">
        <div className="rounded-lg border border-[#0A3D5C]/10 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <Truck className="size-6 text-[#00B4D8]" />
            <h2 className="font-display text-2xl font-bold">Zonas y tarifas</h2>
          </div>
          <div className="grid gap-3">
            {zones.map(([name, price, detail]) => (
              <div
                key={name}
                className="grid gap-2 rounded-lg bg-[#F8FAFB] p-4 sm:grid-cols-[1fr_120px_1fr]"
              >
                <p className="font-bold text-[#0A3D5C]">{name}</p>
                <p className="font-display text-xl font-bold text-[#FF6B35]">
                  {price}
                </p>
                <p className="text-sm text-[#617789]">{detail}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          {[
            [MapPin, "Punto de venta", contactInfo.address],
            [Clock, "Tiempos", "Entrega local usualmente el mismo día o siguiente día hábil."],
            [PackageCheck, "Condiciones", "Productos grandes o pesados pueden requerir confirmación especial."],
          ].map(([Icon, title, text]) => (
            <div
              key={title as string}
              className="rounded-lg border border-[#0A3D5C]/10 bg-white p-4 shadow-sm"
            >
              <Icon className="size-6 text-[#00B4D8]" />
              <h3 className="mt-3 font-display text-xl font-bold">
                {title as string}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#617789]">
                {text as string}
              </p>
            </div>
          ))}
        </aside>
      </section>

      <InfoFooter />
    </main>
  );
}
