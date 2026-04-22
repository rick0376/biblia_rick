//app/favoritos/page.tsx

import Link from "next/link";
import { prisma } from "../../lib/prisma";
import styles from "./styles.module.scss";

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
    <main className={styles.container}>
      <div className={styles.inner}>
        <Link href="/" className={styles.backLink}>
          ← Voltar
        </Link>

        <h1 className={styles.title}>Favoritos</h1>

        <p className={styles.subtitle}>Seus versículos e hinos salvos.</p>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Versículos favoritos ({versiculos.length})
          </h2>

          {versiculos.length === 0 ? (
            <p className={styles.empty}>Nenhum versículo favorito ainda.</p>
          ) : (
            <div className={styles.grid}>
              {versiculos.map((item) => {
                const verse = item.verse;
                const chapter = verse.chapter;
                const book = chapter.book;
                const version = verse.translation.code;

                return (
                  <Link
                    key={item.id}
                    href={`/livros/${book.slug}/${chapter.number}?v=${version}#v-${verse.number}`}
                    className={styles.card}
                  >
                    <div className={styles.cardHeader}>
                      {book.name} {chapter.number}:{verse.number} •{" "}
                      {version.toUpperCase()}
                    </div>

                    <div className={styles.cardText}>{verse.text}</div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Hinos favoritos ({hinos.length})
          </h2>

          {hinos.length === 0 ? (
            <p className={styles.empty}>Nenhum hino favorito ainda.</p>
          ) : (
            <div className={styles.grid}>
              {hinos.map((item) => (
                <Link
                  key={item.id}
                  href={`/harpa/${item.hymn.number}`}
                  className={styles.card}
                >
                  <div className={styles.cardHeader}>
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
