import { Building2, CheckCircle2, Droplets, UsersRound } from "lucide-react";
import type { Metadata } from "next";
import { InfoFooter, InfoHeader } from "../info-layout";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Conoce Distribuciones LYM, empresa especializada en químicos, equipos, mantenimiento y construcción de piscinas.",
};

export default function NosotrosPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFB] text-[#062A3E]">
      <InfoHeader active="Nosotros" />

      <section className="border-b border-[#0A3D5C]/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div className="pool-depth relative overflow-hidden rounded-lg p-6 text-white">
            <div className="water-grid absolute inset-0" />
            <div className="relative">
              <div className="mb-6 flex size-14 items-center justify-center rounded-lg bg-white/12">
                <Building2 className="size-7 text-[#8BE7F7]" />
              </div>
              <p className="text-xs font-bold uppercase text-[#8BE7F7]">
                Nosotros
              </p>
              <h1 className="mt-2 font-display text-4xl font-bold leading-tight">
                10 años creando soluciones para piscinas.
              </h1>
              <p className="mt-4 text-sm leading-6 text-cyan-50/84">
                Distribuciones LYM es una empresa especializada en productos
                químicos para mantenimiento de piscinas, construcción, diseño y
                soluciones técnicas para espacios acuáticos seguros y
                funcionales.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            {[
              ["10+", "años de experiencia"],
              ["154", "productos cargados en tienda"],
              ["Meta", "atención local en Villavicencio"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="rounded-lg border border-[#0A3D5C]/10 bg-white p-5 shadow-sm"
              >
                <p className="font-display text-4xl font-bold text-[#0A3D5C]">
                  {value}
                </p>
                <p className="mt-1 text-sm text-[#617789]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            [
              Droplets,
              "Misión",
              "Satisfacer las necesidades de nuestros clientes con químicos para tratamiento de aguas, electrobombas, equipos para piscinas, redes hidráulicas, construcción y mantenimiento.",
            ],
            [
              UsersRound,
              "Experiencia",
              "Contamos con un equipo capacitado para ofrecer soluciones personalizadas, seguras y eficientes en tratamiento de agua y espacios acuáticos.",
            ],
            [
              CheckCircle2,
              "Compromiso",
              "Garantizar agua cristalina, productos confiables y acompañamiento para hogares, hoteles, conjuntos y proyectos.",
            ],
          ].map(([Icon, title, text]) => (
            <article
              key={title as string}
              className="rounded-lg border border-[#0A3D5C]/10 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-[#EAF8FC] text-[#0084A3]">
                <Icon className="size-5" />
              </div>
              <h2 className="font-display text-xl font-bold">
                {title as string}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#617789]">
                {text as string}
              </p>
            </article>
          ))}
        </div>
      </section>

      <InfoFooter />
    </main>
  );
}
