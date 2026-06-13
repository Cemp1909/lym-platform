import {
  Clock,
  Mail,
  MapPinned,
  PhoneCall,
  ShoppingCart,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { contactInfo } from "../contact-info";
import { InfoFooter, InfoHeader } from "../info-layout";
import { whatsappMessages, whatsappUrl } from "../whatsapp";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Contacto de Distribuciones LYM para compras, domicilios, cotizaciones y proyectos de piscina en Villavicencio.",
};

export default function ContactoPage() {
  const mapsQuery = encodeURIComponent(contactInfo.mapsQuery);

  return (
    <main className="min-h-screen bg-[#F8FAFB] text-[#062A3E]">
      <InfoHeader active="Contacto" />

      <section className="border-b border-[#0A3D5C]/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase text-[#00B4D8]">
              Contáctenos
            </p>
            <h1 className="mt-2 max-w-3xl font-display text-4xl font-bold leading-tight">
              Atención para compras, domicilios y proyectos.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#617789]">
              Escríbenos para confirmar disponibilidad, recibir asesoría o
              coordinar productos, mantenimiento y construcción de piscinas.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                [Mail, "Correo", contactInfo.email],
                [MapPinned, "Dirección", contactInfo.address],
                [
                  PhoneCall,
                  "Teléfono",
                  `${contactInfo.phone} / ${contactInfo.secondaryPhone}`,
                ],
                [Clock, "Horario", "Lunes a sábado, atención comercial"],
              ].map(([Icon, label, value]) => (
                <div
                  key={label as string}
                  className="rounded-lg border border-[#0A3D5C]/10 bg-[#F8FAFB] p-4"
                >
                  <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-white text-[#0A3D5C]">
                    <Icon className="size-5" />
                  </div>
                  <p className="text-xs font-bold uppercase text-[#617789]">
                    {label as string}
                  </p>
                  <p className="mt-1 text-sm font-bold leading-6 text-[#0A3D5C]">
                    {value as string}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#0A3D5C]/10 bg-[#F8FAFB] p-4 shadow-sm">
            <h2 className="font-display text-2xl font-bold">Contacto rápido</h2>
            <div className="mt-4 grid gap-3">
              <a
                href={whatsappUrl(whatsappMessages.general)}
                target="_blank"
                rel="noreferrer"
                className="flex h-12 items-center justify-center gap-2 rounded-lg bg-[#0A3D5C] px-4 text-sm font-bold text-white"
              >
                <Smartphone className="size-4" />
                Atención WhatsApp
              </a>
              <a
                href={`mailto:${contactInfo.email}`}
                className="flex h-12 items-center justify-center gap-2 rounded-lg border border-[#0A3D5C]/12 bg-white px-4 text-sm font-bold text-[#0A3D5C]"
              >
                <Mail className="size-4" />
                Enviar correo
              </a>
              <Link
                href="/#catalogo"
                className="flex h-12 items-center justify-center gap-2 rounded-lg border border-[#0A3D5C]/12 bg-white px-4 text-sm font-bold text-[#0A3D5C]"
              >
                <ShoppingCart className="size-4" />
                Ir a productos
              </Link>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                target="_blank"
                rel="noreferrer"
                className="flex h-12 items-center justify-center gap-2 rounded-lg border border-[#0A3D5C]/12 bg-white px-4 text-sm font-bold text-[#0A3D5C]"
              >
                <MapPinned className="size-4" />
                Abrir en Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-lg border border-[#0A3D5C]/10 bg-white shadow-sm">
          <iframe
            title="Ubicación Distribuciones LYM"
            src={`https://www.google.com/maps?q=${mapsQuery}&z=18&output=embed`}
            className="h-80 w-full"
            loading="lazy"
          />
        </div>
      </section>

      <InfoFooter />
    </main>
  );
}
