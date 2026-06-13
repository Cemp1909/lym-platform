"use client";

import {
  Building2,
  CheckCircle2,
  ChevronRight,
  Droplets,
  MessageCircle,
  Truck,
  Wrench,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { InfoFooter, InfoHeader } from "../info-layout";
import { products } from "../products";
import { whatsappMessages, whatsappUrl } from "../whatsapp";

const services = [
  {
    icon: Droplets,
    title: "Químicos especializados",
    text: "Tratamiento, limpieza, mantenimiento y balance del agua para piscinas residenciales y comerciales.",
    image: products[1].image,
    includes: [
      "Revisión visual del estado del agua",
      "Recomendación de químicos según necesidad",
      "Balance de pH, cloro, alcalinidad y clarificación",
      "Guía de aplicación segura",
    ],
    idealFor: "Piscinas con agua verde, turbia, olor fuerte o mantenimiento recurrente.",
    related: ["Cloro granulado", "Alguicidas", "Clarificadores", "Kits de prueba"],
  },
  {
    icon: Wrench,
    title: "Equipos y electrobombas",
    text: "Suministro de equipos, accesorios, repuestos y soluciones para circulación y filtración.",
    image: products[68].image,
    includes: [
      "Asesoría para elegir bomba, filtro o repuesto",
      "Validación de compatibilidad",
      "Cotización de equipos y accesorios",
      "Recomendaciones de instalación",
    ],
    idealFor: "Clientes que necesitan cambiar bomba, filtro, boquillas, luces o accesorios.",
    related: ["Electrobombas", "Filtros", "Boquillas", "Reflectores"],
  },
  {
    icon: Truck,
    title: "Mantenimiento",
    text: "Apoyo operativo para conservar piscinas en condiciones seguras, limpias y funcionales.",
    image: products[35].image,
    includes: [
      "Limpieza de superficie y fondo",
      "Revisión de accesorios básicos",
      "Apoyo con productos de mantenimiento",
      "Plan de compra recurrente",
    ],
    idealFor: "Hogares, fincas, hoteles y conjuntos con mantenimiento frecuente.",
    related: ["Cepillos", "Nasa recogehojas", "Aspiradoras", "Mangueras"],
  },
  {
    icon: Building2,
    title: "Diseño y construcción",
    text: "Proyectos personalizados que combinan funcionalidad, seguridad y estética.",
    image: products[32].image,
    includes: [
      "Asesoría inicial del proyecto",
      "Revisión de necesidades y espacio",
      "Suministro de equipos y accesorios",
      "Acompañamiento comercial",
    ],
    idealFor: "Proyectos nuevos, remodelaciones y mejoras de zonas húmedas.",
    related: ["Cascadas", "Luces", "Pasamanos", "Equipos de filtración"],
  },
];

export default function ServiciosPage() {
  const [selectedService, setSelectedService] = useState<(typeof services)[number] | null>(
    null,
  );

  return (
    <main className="min-h-screen bg-[#F8FAFB] text-[#062A3E]">
      <InfoHeader active="Servicios" />

      <section className="border-b border-[#0A3D5C]/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase text-[#00B4D8]">
                Servicios
              </p>
              <h1 className="mt-2 max-w-3xl font-display text-4xl font-bold leading-tight">
                Además de vender productos, acompañamos el proyecto.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#617789]">
                Soluciones para mantenimiento, equipos, redes hidráulicas,
                construcción y diseño de espacios acuáticos.
              </p>
            </div>
            <Link
              href="/contacto"
              className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#FF6B35] px-5 text-sm font-bold text-white"
            >
              Solicitar asesoría
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          {services.map((service) => (
            <article
              key={service.title}
              className="rounded-lg border border-[#0A3D5C]/10 bg-white p-5 shadow-sm"
            >
              <div className="relative mb-4 h-36 overflow-hidden rounded-lg bg-[#F8FAFB]">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  sizes="420px"
                  className="object-contain p-4"
                />
              </div>
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-[#EAF8FC] text-[#0084A3]">
                <service.icon className="size-6" />
              </div>
              <h2 className="font-display text-2xl font-bold">
                {service.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#617789]">
                {service.text}
              </p>
              <button
                onClick={() => setSelectedService(service)}
                className="mt-5 flex h-11 items-center justify-center gap-2 rounded-lg border border-[#0A3D5C]/12 px-4 text-sm font-bold text-[#0A3D5C]"
              >
                Más detalles
                <ChevronRight className="size-4" />
              </button>
            </article>
          ))}
        </div>
      </section>

      {selectedService ? (
        <div className="fixed inset-0 z-50 bg-[#031B2A]/68 px-3 py-4 backdrop-blur-sm sm:px-6">
          <div className="mx-auto grid max-h-[calc(100vh-2rem)] max-w-5xl overflow-y-auto rounded-lg bg-white shadow-2xl lg:grid-cols-[0.85fr_1.15fr]">
            <div className="relative min-h-[320px] bg-[#F8FAFB] p-5">
              <button
                onClick={() => setSelectedService(null)}
                className="absolute right-4 top-4 z-10 flex size-10 items-center justify-center rounded-lg border border-[#0A3D5C]/12 bg-white"
                aria-label="Cerrar detalle"
              >
                <X className="size-5" />
              </button>
              <div className="relative h-full min-h-[300px] overflow-hidden rounded-lg bg-white">
                <Image
                  src={selectedService.image}
                  alt={selectedService.title}
                  fill
                  sizes="420px"
                  className="object-contain p-8"
                />
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <p className="text-xs font-bold uppercase text-[#00B4D8]">
                Detalle del servicio
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold">
                {selectedService.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#617789]">
                {selectedService.text}
              </p>

              <div className="mt-5 rounded-lg bg-[#F8FAFB] p-4">
                <p className="font-display text-xl font-bold">Incluye</p>
                <div className="mt-3 grid gap-2">
                  {selectedService.includes.map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#2FBF71]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-[#0A3D5C]/10 bg-white p-4">
                  <p className="font-display text-lg font-bold">Ideal para</p>
                  <p className="mt-2 text-sm leading-6 text-[#617789]">
                    {selectedService.idealFor}
                  </p>
                </div>
                <div className="rounded-lg border border-[#0A3D5C]/10 bg-white p-4">
                  <p className="font-display text-lg font-bold">
                    Productos relacionados
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedService.related.map((item) => (
                      <span
                        key={item}
                        className="rounded-md bg-[#EAF8FC] px-2 py-1 text-xs font-bold text-[#0084A3]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <a
                  href={whatsappUrl(whatsappMessages.service(selectedService.title))}
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#FF6B35] text-sm font-bold text-white"
                >
                  <MessageCircle className="size-4" />
                  Consultar por WhatsApp
                </a>
                <Link
                  href="/#catalogo"
                  className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#0A3D5C]/12 text-sm font-bold text-[#0A3D5C]"
                >
                  Ver productos
                  <ChevronRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <InfoFooter />
    </main>
  );
}
