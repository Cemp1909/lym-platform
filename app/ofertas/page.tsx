"use client";

import Image from "next/image";
import { BadgePercent, ChevronRight, MessageCircle, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { InfoFooter, InfoHeader } from "../info-layout";
import { products } from "../products";
import { whatsappMessages, whatsappUrl } from "../whatsapp";

type PublicOffer = {
  id: number;
  title: string;
  target: string;
  discount: string;
  active: boolean;
};

const fallbackOffers: PublicOffer[] = [
  {
    id: 1,
    title: "Domicilio gratis",
    target: "Pedidos locales desde $200.000",
    discount: "100% domicilio",
    active: true,
  },
  {
    id: 2,
    title: "Kit mantenimiento",
    target: "Químicos + accesorios",
    discount: "10%",
    active: true,
  },
];

export default function OfertasPage() {
  const [adminOffers] = useState<PublicOffer[]>(() => {
    if (typeof window === "undefined") return fallbackOffers;

    const savedOffers = window.localStorage.getItem("lym-admin-offers");

    if (savedOffers) {
      return JSON.parse(savedOffers);
    }

    return fallbackOffers;
  });

  const activeOffers = adminOffers.filter((offer) => offer.active);
  const offerProducts = useMemo(() => {
    return products.slice(0, 8).map((product, index) => {
      const matchingOffer =
        activeOffers.find((offer) =>
          product.name.toLowerCase().includes(offer.target.toLowerCase()),
        ) || activeOffers[index % Math.max(activeOffers.length, 1)];

      return {
        ...product,
        discount: matchingOffer?.discount || "Oferta",
        note: matchingOffer?.title || "Promoción administrable",
      };
    });
  }, [activeOffers]);

  return (
    <main className="min-h-screen bg-[#F8FAFB] text-[#062A3E]">
      <InfoHeader active="Ofertas" />

      <section className="border-b border-[#0A3D5C]/10 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase text-[#00B4D8]">
            Ofertas
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-bold leading-tight">
            Productos en oferta para comprar o cotizar.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#617789]">
            Estas ofertas leen visualmente lo que se crea en el panel de
            administrador. En producción se conectarán a la base de datos.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap gap-2">
          {activeOffers.map((offer) => (
            <span
              key={offer.id}
              className="rounded-lg border border-[#0A3D5C]/10 bg-white px-3 py-2 text-sm font-bold text-[#0A3D5C]"
            >
              {offer.title} · {offer.discount}
            </span>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {offerProducts.map((product) => (
            <article
              key={product.id}
              className="rounded-lg border border-[#0A3D5C]/10 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-[#F8FAFB]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="280px"
                  className="object-contain p-5"
                />
                <span className="absolute right-3 top-3 rounded-md bg-[#FFF4EF] px-3 py-1 text-sm font-bold text-[#C2441A] shadow-sm">
                  {product.discount}
                </span>
              </div>

              <div className="mt-4">
                <span className="rounded-md bg-[#EAF8FC] px-2 py-1 text-xs font-bold text-[#0084A3]">
                  {product.category}
                </span>
                <h2 className="mt-3 min-h-12 font-display text-lg font-bold leading-6">
                  {product.name}
                </h2>
              </div>

              <p className="mt-2 text-sm text-[#617789]">{product.note}</p>
              <p className="mt-3 font-display text-2xl font-bold text-[#0A3D5C]">
                {product.price === null
                  ? "Cotizar"
                  : `$${product.price.toLocaleString("es-CO")}`}
              </p>

              <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                <Link
                  href="/#catalogo"
                  className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#FF6B35] text-sm font-bold text-white"
                >
                  Comprar
                  <ChevronRight className="size-4" />
                </Link>
                <a
                  href={whatsappUrl(whatsappMessages.offer(product.name))}
                  target="_blank"
                  rel="noreferrer"
                  className="flex size-11 items-center justify-center rounded-lg border border-[#0A3D5C]/12 text-[#0A3D5C]"
                  aria-label={`Consultar oferta ${product.name}`}
                >
                  <MessageCircle className="size-4" />
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-5 rounded-lg border border-[#0A3D5C]/10 bg-white p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-[#0A3D5C]">
                <BadgePercent className="size-4 text-[#FF6B35]" />
                Ofertas administrables
              </div>
              <p className="mt-1 text-sm text-[#617789]">
                Desde el admin se crean ofertas por producto, categoría o condición.
              </p>
            </div>
            <Link
              href="/admin"
              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#0A3D5C]/12 px-4 text-sm font-bold text-[#0A3D5C]"
            >
              <ShoppingCart className="size-4" />
              Ver admin
            </Link>
          </div>
        </div>
      </section>

      <InfoFooter />
    </main>
  );
}
