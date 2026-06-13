"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const themeStorageKey = "lym-theme";
const themeChangeEvent = "lym-theme-change";

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark-mode", dark);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.body.classList.toggle("dark-mode", dark);
  document.body.dataset.theme = dark ? "dark" : "light";
}

export function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(themeStorageKey) === "dark";
  });

  useEffect(() => {
    applyTheme(dark);
  }, [dark]);

  useEffect(() => {
    function syncTheme(event: Event) {
      const nextDark = (event as CustomEvent<boolean>).detail;

      if (typeof nextDark === "boolean") {
        setDark(nextDark);
      }
    }

    window.addEventListener(themeChangeEvent, syncTheme);

    return () => window.removeEventListener(themeChangeEvent, syncTheme);
  }, []);

  function toggleTheme() {
    const nextDark = !dark;

    setDark(nextDark);
    applyTheme(nextDark);
    window.localStorage.setItem(themeStorageKey, nextDark ? "dark" : "light");
    window.dispatchEvent(new CustomEvent(themeChangeEvent, { detail: nextDark }));
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex size-10 items-center justify-center rounded-lg border border-[#0A3D5C]/12 bg-white text-[#0A3D5C] transition hover:bg-[#F8FAFB]"
      aria-label={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={dark ? "Modo claro" : "Modo oscuro"}
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
