//app/components/ThemeToggle.tsx

"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");

    const initialTheme: Theme =
      saved === "light" ? "light" : "dark";

    setTheme(initialTheme);
    document.documentElement.dataset.theme = initialTheme;

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  function toggleTheme() {
    setTheme((prev) =>
      prev === "dark" ? "light" : "dark"
    );
  }

  if (!mounted) {
    return (
      <button
        type="button"
        className="themeToggle"
        aria-label="Alterar tema"
      >
        Tema
      </button>
    );
  }

  return (
    <button
      type="button"
      className="themeToggle"
      onClick={toggleTheme}
    >
      {theme === "dark" ? "☀️ Claro" : "🌙 Noite"}
    </button>
  );
}