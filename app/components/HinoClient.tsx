// app/components/HinoClient.tsx

"use client";

import { useState } from "react";

type Verse = {
  id: number;
  type: string;
  number: number;
  text: string;
};

type HinoClientProps = {
  hymnId: number;
  hymnNumber: number;
  hymnTitle: string;
  isFavorite: boolean;
  verses: Verse[];
  styles: Record<string, string>;
  canAddFavorites: boolean;
};

export default function HinoClient({
  hymnId,
  hymnNumber,
  hymnTitle,
  isFavorite,
  verses,
  styles,
  canAddFavorites,
}: HinoClientProps) {
  const [favorito, setFavorito] =
    useState(isFavorite);

  const [carregando, setCarregando] =
    useState(false);

  async function toggleFavorito() {
    if (!canAddFavorites) {
      return;
    }

    try {
      setCarregando(true);

      const res = await fetch(
        "/api/favoritos/hinos",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            hymnId,
          }),
        },
      );

      if (!res.ok) {
        return;
      }

      const data =
        (await res.json()) as {
          isFavorite: boolean;
        };

      setFavorito(
        data.isFavorite,
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "12px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            color:
              "var(--text-secondary)",
            fontWeight: 700,
          }}
        >
          Hino {hymnNumber} •{" "}
          {hymnTitle}
        </div>

        <button
          type="button"
          onClick={toggleFavorito}
          disabled={
            carregando ||
            !canAddFavorites
          }
          title={
            canAddFavorites
              ? favorito
                ? "Remover dos favoritos"
                : "Adicionar aos favoritos"
              : "Favoritos não liberados para este usuário"
          }
          style={{
            border:
              "1px solid var(--accent-soft-border)",

            background: favorito
              ? "var(--accent-gradient-2)"
              : "var(--surface-2)",

            color: favorito
              ? "var(--accent-strong-text)"
              : "var(--accent-text)",

            borderRadius:
              "999px",

            padding:
              "8px 14px",

            cursor:
              canAddFavorites
                ? "pointer"
                : "not-allowed",

            fontWeight: 700,

            opacity:
              canAddFavorites
                ? 1
                : 0.5,
          }}
        >
          {!canAddFavorites
            ? "🔒 Favoritos bloqueados"
            : carregando
              ? "..."
              : favorito
                ? "★ Hino favorito"
                : "☆ Favoritar hino"}
        </button>
      </div>

      <ol className={styles.list}>
        {verses.map((v) => (
          <li
            key={v.id}
            className={styles.card}
          >
            {v.type === "VERSE" && (
              <>
                <div
                  className={
                    styles.badge
                  }
                >
                  Estrofe {v.number}
                </div>

                <pre
                  className={
                    styles.text
                  }
                >
                  {v.text}
                </pre>
              </>
            )}

            {v.type === "CHORUS" && (
              <div
                className={
                  styles.chorusBox
                }
              >
                <div
                  className={
                    styles.chorusBadge
                  }
                >
                  Coro
                </div>

                <pre
                  className={
                    styles.chorusText
                  }
                >
                  {v.text}
                </pre>
              </div>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}