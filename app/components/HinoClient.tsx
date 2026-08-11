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

      setFavorito(data.isFavorite);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <>
      <section className={styles.actionBar}>
        <div className={styles.actionInfo}>
          <span className={styles.actionIcon}>
            {favorito ? "★" : "♫"}
          </span>

          <div>
            <strong>
              Hino {hymnNumber}
            </strong>

            <span>
              {hymnTitle}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleFavorito}
          disabled={
            carregando ||
            !canAddFavorites
          }
          className={`${styles.favoriteButton} ${favorito
              ? styles.favoriteButtonActive
              : ""
            }`}
          title={
            !canAddFavorites
              ? "Favoritos não liberados para este usuário"
              : favorito
                ? "Remover dos favoritos"
                : "Adicionar aos favoritos"
          }
        >
          {!canAddFavorites
            ? "🔒 Favoritos bloqueados"
            : carregando
              ? "Salvando..."
              : favorito
                ? "★ Hino favorito"
                : "☆ Favoritar hino"}
        </button>
      </section>

      <ol className={styles.list}>
        {verses.map((verse) => (
          <li
            key={verse.id}
            className={`${styles.card} ${verse.type === "CHORUS"
                ? styles.chorusCard
                : ""
              }`}
          >
            {verse.type === "VERSE" && (
              <>
                <div
                  className={
                    styles.verseHeader
                  }
                >
                  <span
                    className={styles.badge}
                  >
                    Estrofe {verse.number}
                  </span>

                  <span
                    className={
                      styles.verseDecoration
                    }
                  >
                    ♪
                  </span>
                </div>

                <pre className={styles.text}>
                  {verse.text}
                </pre>
              </>
            )}

            {verse.type === "CHORUS" && (
              <div
                className={styles.chorusBox}
              >
                <div
                  className={
                    styles.chorusHeader
                  }
                >
                  <span
                    className={
                      styles.chorusBadge
                    }
                  >
                    ♫ Coro
                  </span>

                  <span
                    className={
                      styles.chorusDecoration
                    }
                  >
                    ♪
                  </span>
                </div>

                <pre
                  className={
                    styles.chorusText
                  }
                >
                  {verse.text}
                </pre>
              </div>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}