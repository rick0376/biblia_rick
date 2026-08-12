//app/components/ThemeToggle.tsx

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Theme = "dark" | "light";

export default function ThemeToggle() {
  const pathname = usePathname();

  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  const isHome = pathname === "/";

  /* =======================================================
     CARREGA O TEMA SALVO
  ======================================================= */

  useEffect(() => {
    const saved = localStorage.getItem("theme");

    const initialTheme: Theme =
      saved === "light" ? "light" : "dark";

    setTheme(initialTheme);
    setMounted(true);
  }, []);

  /* =======================================================
     APLICA O TEMA
  ======================================================= */

  useEffect(() => {
    if (!mounted) return;

    /* Home fica sempre escura */
    if (isHome) {
      document.documentElement.dataset.theme = "dark";
      return;
    }

    /* Outras páginas usam a preferência do usuário */
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme, mounted, isHome]);

  /* =======================================================
     ALTERA O TEMA
  ======================================================= */

  function toggleTheme() {
    setTheme((prev) =>
      prev === "dark" ? "light" : "dark",
    );
  }

  /* =======================================================
     NÃO MOSTRA NA HOME
  ======================================================= */

  if (isHome) {
    return null;
  }

  if (!mounted) {
    return null;
  }

  /* =======================================================
     BOTÃO NAS OUTRAS PÁGINAS
  ======================================================= */

  return (
    <button
      type="button"
      className="themeToggle"
      onClick={toggleTheme}
      aria-label="Alterar tema"
    >
      {theme === "dark" ? "☀️ Claro" : "🌙 Noite"}
    </button>
  );
}