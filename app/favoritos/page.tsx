//app/favoritos/page.tsx

import Link from "next/link";
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FavoritosPage() {
  const [versiculos, hinos] = await Promise.all([
    prisma.favoriteVerse.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        verse: {
          include: {
            translation: true,
            chapter: {
              include: {
                book: true,
              },
            },
          },
        },
      },
    }),
    prisma.favoriteHymn.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        hymn: true,
      },
    }),
  ]);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 20px",
        background:
          "radial-gradient(circle at top, #1f2342 0%, #0d1122 45%, #070b14 100%)",
        color: "#f5f5f5",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 20,
            color: "#f6d36a",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          ← Voltar
        </Link>

        <h1 style={{ fontSize: 42, marginBottom: 8 }}>Favoritos</h1>
        <p style={{ color: "rgba(255,255,255,0.75)", marginBottom: 28 }}>
          Seus versículos e hinos salvos.
        </p>

        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 28, marginBottom: 16 }}>
            Versículos favoritos ({versiculos.length})
          </h2>

          {versiculos.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.7)" }}>
              Nenhum versículo favorito ainda.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gap: 14,
              }}
            >
              {versiculos.map((item) => {
                const verse = item.verse;
                const chapter = verse.chapter;
                const book = chapter.book;
                const version = verse.translation.code;

                return (
                  <Link
                    key={item.id}
                    href={`/livros/${book.slug}/${chapter.number}?v=${version}#v-${verse.number}`}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 18,
                      padding: 18,
                      background: "rgba(255,255,255,0.04)",
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 800,
                        marginBottom: 10,
                        color: "#f6d36a",
                      }}
                    >
                      {book.name} {chapter.number}:{verse.number} •{" "}
                      {version.toUpperCase()}
                    </div>
                    <div style={{ lineHeight: 1.7 }}>{verse.text}</div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h2 style={{ fontSize: 28, marginBottom: 16 }}>
            Hinos favoritos ({hinos.length})
          </h2>

          {hinos.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.7)" }}>
              Nenhum hino favorito ainda.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gap: 14,
              }}
            >
              {hinos.map((item) => (
                <Link
                  key={item.id}
                  href={`/harpa/${item.hymn.number}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 18,
                    padding: 18,
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      color: "#f6d36a",
                    }}
                  >
                    {item.hymn.number}. {item.hymn.title}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
