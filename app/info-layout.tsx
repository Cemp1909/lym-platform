"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut, ShoppingCart, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { contactInfo } from "./contact-info";
import { FloatingWhatsApp } from "./floating-whatsapp";
import { createSupabaseBrowserClient } from "./supabase/browser";
import { ThemeToggle } from "./theme-toggle";

const currentUserStorageKey = "lym-current-user";

const navItems = [
  ["Tienda", "/"],
  ["Ofertas", "/ofertas"],
  ["Estado", "/estado-pedido"],
  ["Nosotros", "/nosotros"],
  ["Servicios", "/servicios"],
  ["Domicilios", "/domicilios"],
  ["Guías", "/guias"],
  ["Contacto", "/contacto"],
  ["Políticas", "/politicas"],
];

export function InfoHeader({ active }: { active: string }) {
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const displayName =
    currentUser?.name || currentUser?.email.split("@")[0] || "Cliente";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const supabase = createSupabaseBrowserClient();

      supabase.auth.getSession().then(async ({ data }) => {
        const token = data.session?.access_token;

        if (!token) return;

        const response = await fetch("/api/account/me", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (!response.ok) return;

        const payload = (await response.json()) as {
          user?: { name: string; email: string };
        };

        if (payload.user) setCurrentUser(payload.user);
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function logout() {
    createSupabaseBrowserClient().auth.signOut();
    window.localStorage.removeItem(currentUserStorageKey);
    setCurrentUser(null);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[#0A3D5C]/10 bg-[#F8FAFB]/92 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative size-12 overflow-hidden rounded-lg border border-[#0A3D5C]/10 bg-white">
            <Image
              src="/brand/logo.png"
              alt="Logo Distribuciones LYM"
              fill
              sizes="48px"
              className="object-contain p-1.5"
              priority
            />
          </div>
          <div>
            <p className="font-display text-lg font-bold leading-none">
              Distribuciones LYM
            </p>
            <p className="text-xs text-[#617789]">Soluciones para su piscina</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-bold text-[#36586C] md:flex">
          {navItems.map(([label, href]) => (
            <Link
              key={label}
              href={href}
              className={`rounded-lg px-3 py-2 transition ${
                active === label
                  ? "bg-[#0A3D5C] text-white"
                  : "hover:bg-white hover:text-[#0A3D5C]"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {currentUser ? (
            <div className="hidden items-center gap-2 rounded-lg border border-[#0A3D5C]/12 bg-white px-3 py-2 text-sm font-bold text-[#0A3D5C] sm:flex">
              <UserRound className="size-4" />
              {displayName}
              <button
                onClick={logout}
                className="ml-1 flex size-6 items-center justify-center rounded-md text-[#617789] hover:bg-[#F8FAFB]"
                aria-label="Cerrar sesión"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/"
              className="hidden h-10 items-center gap-2 rounded-lg border border-[#0A3D5C]/12 bg-white px-4 text-sm font-bold text-[#0A3D5C] sm:flex"
            >
              <UserRound className="size-4" />
              Ingresar
            </Link>
          )}
          <Link
            href="/#catalogo"
            className="flex h-10 items-center gap-2 rounded-lg bg-[#FF6B35] px-4 text-sm font-bold text-white"
          >
            <ShoppingCart className="size-4" />
            Comprar
          </Link>
        </div>
      </div>
    </header>
  );
}

export function InfoFooter() {
  return (
    <>
      <FloatingWhatsApp />
      <footer className="bg-[#062A3E] text-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:px-6 md:grid-cols-[1fr_auto] lg:px-8">
          <div>
            <p className="font-display text-lg font-bold">Distribuciones LYM</p>
            <p className="mt-1 text-sm text-cyan-50/72">
              {contactInfo.address}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-cyan-50/82">
            {navItems.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="rounded-lg px-3 py-2 hover:bg-white/10"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
