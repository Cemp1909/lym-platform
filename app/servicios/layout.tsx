import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Servicios de mantenimiento, químicos especializados, equipos, electrobombas, diseño y construcción de piscinas.",
};

export default function ServiciosLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
