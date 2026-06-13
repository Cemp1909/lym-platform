import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://distribucioneslym.com"),
  title: {
    default: "Distribuciones LYM | Tienda para piscinas",
    template: "%s | Distribuciones LYM",
  },
  description:
    "Tienda online de productos para piscina, cotizaciones, domicilios, ofertas y gestión administrativa para Distribuciones LYM.",
  keywords: [
    "productos para piscina",
    "químicos para piscina",
    "Distribuciones LYM",
    "piscinas Villavicencio",
    "cloro para piscina",
    "mantenimiento de piscinas",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Distribuciones LYM",
    description:
      "Productos, químicos, equipos y soluciones para piscinas en Villavicencio.",
    siteName: "Distribuciones LYM",
    locale: "es_CO",
    type: "website",
    url: "https://distribucioneslym.com",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/logo.png?v=lym6", type: "image/png" },
      { url: "/favicon.png?v=lym6", type: "image/png" },
      { url: "/icon.png?v=lym6", type: "image/png" },
    ],
    shortcut: "/brand/logo.png?v=lym6",
    apple: "/apple-icon.png?v=lym6",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${syne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
