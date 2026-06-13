import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ChevronRight, Droplets, ShieldCheck, Sparkles } from "lucide-react";
import { InfoFooter, InfoHeader } from "../info-layout";

export const metadata: Metadata = {
  title: "Guías",
  description:
    "Guías prácticas para mantenimiento de piscinas, químicos, cloro, pH y cuidado del agua.",
};

const guides = [
  {
    title: "Cómo mantener el agua cristalina",
    text: "Revisa filtración, cepillado, niveles de cloro y pH antes de aplicar productos correctivos.",
    icon: Droplets,
  },
  {
    title: "Cada cuánto aplicar cloro",
    text: "La frecuencia depende del uso, clima y volumen de agua. Para mayor seguridad, mide antes de dosificar.",
    icon: ShieldCheck,
  },
  {
    title: "Errores comunes en piscinas",
    text: "Mezclar químicos sin asesoría, no revisar pH y descuidar la filtración suele generar agua turbia.",
    icon: Sparkles,
  },
];

export default function GuiasPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFB] text-[#062A3E]">
      <InfoHeader active="Guías" />

      <section className="border-b border-[#0A3D5C]/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase text-[#00B4D8]">
            Guías y consejos
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-bold leading-tight">
            Contenido útil para cuidar mejor tu piscina.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#617789]">
            Una sección preparada para publicar consejos, mantenimiento y
            recomendaciones técnicas que generen confianza antes de comprar.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {guides.map((guide) => (
            <article
              key={guide.title}
              className="rounded-lg border border-[#0A3D5C]/10 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-[#EAF8FC] text-[#0084A3]">
                <guide.icon className="size-6" />
              </div>
              <h2 className="font-display text-2xl font-bold">{guide.title}</h2>
              <p className="mt-3 text-sm leading-6 text-[#617789]">
                {guide.text}
              </p>
              <Link
                href="/#catalogo"
                className="mt-5 flex h-10 items-center justify-center gap-2 rounded-lg border border-[#0A3D5C]/12 text-sm font-bold text-[#0A3D5C]"
              >
                Ver productos recomendados
                <ChevronRight className="size-4" />
              </Link>
            </article>
          ))}
        </div>
        <div className="mt-5 rounded-lg border border-[#0A3D5C]/10 bg-white p-5">
          <div className="flex items-center gap-3">
            <BookOpen className="size-6 text-[#FF6B35]" />
            <p className="font-display text-xl font-bold">
              Próximo paso: conectar artículos reales desde el administrador.
            </p>
          </div>
        </div>
      </section>

      <InfoFooter />
    </main>
  );
}
