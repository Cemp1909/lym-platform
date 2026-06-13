import Link from "next/link";
import { Home, MessageCircle } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F8FAFB] px-4 text-[#062A3E]">
      <div className="max-w-xl rounded-lg border border-[#0A3D5C]/10 bg-white p-6 text-center shadow-sm">
        <p className="text-xs font-bold uppercase text-[#00B4D8]">404</p>
        <h1 className="mt-2 font-display text-4xl font-bold">
          Página no encontrada
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#617789]">
          La ruta que intentas abrir no existe o fue movida. Puedes volver a la
          tienda o escribirnos para recibir ayuda.
        </p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Link
            href="/"
            className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#FF6B35] text-sm font-bold text-white"
          >
            <Home className="size-4" />
            Ir a la tienda
          </Link>
          <a
            href="https://wa.me/573204354064"
            className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#0A3D5C]/12 text-sm font-bold text-[#0A3D5C]"
          >
            <MessageCircle className="size-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
}
