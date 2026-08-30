//app/components/ThemeToggle.tsx

"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Theme = "dark" | "light";

export default function ThemeToggle() {
  const pathname = usePathname();

  const [theme, setTheme] =
    useState<Theme>("dark");

  const [mounted, setMounted] =
    useState(false);

  const isLogin =
    pathname === "/login" ||
    pathname.startsWith("/login/");

  /* =======================================================
     CARREGA O TEMA SALVO
  ======================================================= */

  useEffect(() => {
    const saved =
      localStorage.getItem("theme");

    const initialTheme: Theme =
      saved === "light"
        ? "light"
        : "dark";

    setTheme(initialTheme);
    setMounted(true);
  }, []);

  /* =======================================================
     APLICA O TEMA
  ======================================================= */

  useEffect(() => {
    if (!mounted) {
      return;
    }

    /*
     * Login fica sempre no tema escuro,
     * mas não apaga a preferência salva.
     */
    if (isLogin) {
      document.documentElement.dataset.theme =
        "dark";

      return;
    }

    document.documentElement.dataset.theme =
      theme;

    localStorage.setItem(
      "theme",
      theme,
    );
  }, [theme, mounted, isLogin]);

  /* =======================================================
     ALTERA O TEMA
  ======================================================= */

  function toggleTheme() {
    setTheme((current) =>
      current === "dark"
        ? "light"
        : "dark",
    );
  }

  /* =======================================================
     NÃO MOSTRA NO LOGIN
  ======================================================= */

  if (!mounted || isLogin) {
    return null;
  }

  /* =======================================================
     BOTÃO
  ======================================================= */

  return (
    <button
      type="button"
      className="themeToggle"
      onClick={toggleTheme}
      aria-label="Alterar tema"
      title="Alterar tema"
    >
      {theme === "dark"
        ? "☀️ Claro"
        : "🌙 Noite"}
    </button>
  );
}