//app/components/ThemeToggle.tsx

"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export default function ThemeToggle() {
  const [theme, setTheme] =
    useState<Theme>("dark");

  const [mounted, setMounted] =
    useState(false);

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

    document.documentElement.dataset.theme =
      initialTheme;

    setMounted(true);
  }, []);

  /* =======================================================
     ALTERA O TEMA
  ======================================================= */

  function toggleTheme() {
    const newTheme: Theme =
      theme === "dark"
        ? "light"
        : "dark";

    setTheme(newTheme);

    document.documentElement.dataset.theme =
      newTheme;

    localStorage.setItem(
      "theme",
      newTheme,
    );
  }

  if (!mounted) {
    return null;
  }

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