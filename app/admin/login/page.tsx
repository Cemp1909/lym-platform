"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { KeyRound, Loader2, ShieldCheck, UserRound } from "lucide-react";
import { ThemeToggle } from "../../theme-toggle";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitLogin() {
    if (!username.trim() || !password.trim() || loading) return;

    setLoading(true);
    setError("");

    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(payload?.error || "No se pudo iniciar sesión.");
      setLoading(false);
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#F8FAFB] px-4 text-[#062A3E]">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden border-r border-[#0A3D5C]/10 bg-[#F8FAFB] p-6 text-[#062A3E] lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(0,180,216,0.18),transparent_32%),radial-gradient(circle_at_80%_80%,rgba(255,107,53,0.12),transparent_28%)]" />
          <div className="relative">
            <div className="relative mb-6 size-20 overflow-hidden rounded-lg bg-white">
              <Image
                src="/brand/logo.png"
                alt="Logo Distribuciones LYM"
                fill
                sizes="80px"
                className="object-contain p-1"
              />
            </div>
            <p className="text-xs font-bold uppercase text-[#00B4D8]">
              Acceso protegido
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold leading-tight">
              Panel privado para gestionar la tienda.
            </h1>
            <p className="mt-4 text-sm leading-6 text-[#617789]">
              Esta zona requiere sesión administrativa. La cookie de acceso se
              guarda como HttpOnly y no queda expuesta al navegador.
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <div className="mb-4 flex justify-end">
            <ThemeToggle />
          </div>
          <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-[#EAF8FC] text-[#0084A3]">
            <ShieldCheck className="size-6" />
          </div>
          <p className="text-xs font-bold uppercase text-[#00B4D8]">
            Administrador
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold">
            Ingresar al panel
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#617789]">
            Usa las credenciales configuradas para el administrador.
          </p>

          <label className="mt-5 flex h-12 items-center gap-3 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3">
            <UserRound className="size-5 text-[#617789]" />
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submitLogin();
              }}
              type="text"
              placeholder="Usuario"
              autoComplete="username"
              className="h-full w-full bg-transparent text-sm outline-none"
            />
          </label>

          <label className="mt-3 flex h-12 items-center gap-3 rounded-lg border border-[#0A3D5C]/12 bg-[#F8FAFB] px-3">
            <KeyRound className="size-5 text-[#617789]" />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submitLogin();
              }}
              type="password"
              placeholder="Clave de acceso"
              autoComplete="current-password"
              className="h-full w-full bg-transparent text-sm outline-none"
            />
          </label>

          {error ? (
            <div className="mt-3 rounded-lg border border-[#FFD4C4] bg-[#FFF4EF] px-3 py-2 text-sm font-bold text-[#C2441A]">
              {error}
            </div>
          ) : null}

          <button
            onClick={submitLogin}
            disabled={loading || !username.trim() || !password.trim()}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#FF6B35] text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-[#C6D0D6]"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            Entrar al administrador
          </button>

          <Link
            href="/"
            className="mt-3 flex h-11 items-center justify-center rounded-lg border border-[#0A3D5C]/12 text-sm font-bold text-[#0A3D5C]"
          >
            Volver a la tienda
          </Link>
        </div>
      </div>
    </main>
  );
}
