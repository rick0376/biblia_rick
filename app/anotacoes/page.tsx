//app/anotacoes/page.tsx

import Link from "next/link";
import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AnotacoesPage() {
  const anotacoes = await prisma.verseNote.findMany({
    orderBy: { updatedAt: "desc" },
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
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 20px",
        background: "var(--page-background)",
        color: "var(--text-primary)",
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
            color: "var(--accent-text)",
            textDecoration: "none",
            fontWeight: 700,
          }}
        >
          ← Voltar
        </Link>

        <h1
          style={{
            fontSize: 42,
            marginBottom: 8,
            background: "var(--accent-gradient)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Anotações
        </h1>

        <p
          style={{
            color: "var(--text-secondary)",
            marginBottom: 28,
          }}
        >
          Seus versículos anotados.
        </p>

        {anotacoes.length === 0 ? (
          <p style={{ color: "var(--text-secondary)" }}>
            Nenhuma anotação ainda.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gap: 14,
            }}
          >
            {anotacoes.map((item) => {
              const verse = item.verse;
              const chapter = verse.chapter;
              const book = chapter.book;

              return (
                <Link
                  key={item.id}
                  href={`/livros/${book.slug}/${chapter.number}?v=${verse.translation.code}#v-${verse.number}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    border: "1px solid var(--surface-border)",
                    borderRadius: 18,
                    padding: 18,
                    background: "var(--surface-1)",
                    borderLeft: "6px solid rgba(245, 158, 11, 0.42)",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      marginBottom: 10,
                      color: "var(--accent-text)",
                    }}
                  >
                    {book.name} {chapter.number}:{verse.number} •{" "}
                    {verse.translation.code.toUpperCase()}
                  </div>

                  <div
                    style={{
                      marginBottom: 14,
                      lineHeight: 1.7,
                    }}
                  >
                    {verse.text}
                  </div>

                  <div
                    style={{
                      border: "1px solid var(--accent-soft-border)",
                      background: "rgba(245, 158, 11, 0.08)",
                      borderRadius: 14,
                      padding: 14,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: "var(--accent-text)",
                        marginBottom: 6,
                      }}
                    >
                      Anotação
                    </div>

                    <div
                      style={{
                        color: "var(--text-primary)",
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.6,
                      }}
                    >
                      {item.content}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
