//app/favoritos/page.tsx

import Link from "next/link";

import { prisma } from "../../lib/prisma";
import { requireBibleAuth } from "../../lib/auth/server";

import styles from "./styles.module.scss";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FavoritosPage() {
  const auth = await requireBibleAuth();

  const [versiculos, hinos] = await Promise.all([
    prisma.favoriteVerse.findMany({
      where: {
        userId: auth.user.id,
      },

      orderBy: {
        createdAt: "desc",
      },

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
      where: {
        userId: auth.user.id,
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {
        hymn: true,
      },
    }),
  ]);

  const totalFavoritos =
    versiculos.length + hinos.length;

  return (
    <main className={styles.container}>
      <div className={styles.topArea}>
        <Link
          href="/"
          className={styles.backLink}
        >
          <span className={styles.backIcon}>
            ←
          </span>

          <span className={styles.backText}>
            Voltar
          </span>
        </Link>

        <section className={styles.pageHeading}>
          <div className={styles.headingIcon}>
            ★
          </div>

          <div className={styles.headingContent}>
            <span className={styles.eyebrow}>
              Sua biblioteca pessoal
            </span>

            <h1 className={styles.title}>
              Favoritos
            </h1>

            <p className={styles.subtitle}>
              Acesse rapidamente os versículos
              e hinos que você salvou.
            </p>
          </div>

          <div className={styles.headingStats}>
            <div>
              <strong>
                {totalFavoritos}
              </strong>

              <span>Total</span>
            </div>

            <div>
              <strong>
                {versiculos.length}
              </strong>

              <span>Versículos</span>
            </div>

            <div>
              <strong>
                {hinos.length}
              </strong>

              <span>Hinos</span>
            </div>
          </div>

          <div className={styles.favoriteBadge}>
            <span>★</span>
            Salvos
          </div>
        </section>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <span
              className={styles.sectionEyebrow}
            >
              Escrituras
            </span>

            <h2
              className={styles.sectionTitle}
            >
              Versículos favoritos
            </h2>
          </div>

          <span
            className={styles.sectionCount}
          >
            {versiculos.length}
          </span>
        </div>

        {versiculos.length === 0 ? (
          <div className={styles.empty}>
            <span
              className={styles.emptyIcon}
            >
              ☆
            </span>

            <div>
              <strong>
                Nenhum versículo favorito
              </strong>

              <p>
                Ao favoritar um versículo,
                ele aparecerá aqui.
              </p>
            </div>
          </div>
        ) : (
          <div className={styles.grid}>
            {versiculos.map((item) => {
              const verse = item.verse;

              const chapter =
                verse.chapter;

              const book =
                chapter.book;

              const version =
                verse.translation.code;

              return (
                <Link
                  key={item.id}
                  href={`/livros/${book.slug}/${chapter.number}?v=${version}#v-${verse.number}`}
                  className={`${styles.card} ${styles.verseCard}`}
                >
                  <div
                    className={
                      styles.cardTop
                    }
                  >
                    <div
                      className={
                        styles.cardReference
                      }
                    >
                      <span
                        className={
                          styles.cardIcon
                        }
                      >
                        📖
                      </span>

                      <div>
                        <strong>
                          {book.name}{" "}
                          {chapter.number}:
                          {verse.number}
                        </strong>

                        <small>
                          Versículo favorito
                        </small>
                      </div>
                    </div>

                    <span
                      className={
                        styles.versionBadge
                      }
                    >
                      {version.toUpperCase()}
                    </span>
                  </div>

                  <p
                    className={
                      styles.cardText
                    }
                  >
                    {verse.text}
                  </p>

                  <div
                    className={
                      styles.cardFooter
                    }
                  >
                    <span>
                      ★ Salvo nos favoritos
                    </span>

                    <strong>
                      Ler versículo →
                    </strong>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <span
              className={styles.sectionEyebrow}
            >
              Harpa Cristã
            </span>

            <h2
              className={styles.sectionTitle}
            >
              Hinos favoritos
            </h2>
          </div>

          <span
            className={styles.sectionCount}
          >
            {hinos.length}
          </span>
        </div>

        {hinos.length === 0 ? (
          <div className={styles.empty}>
            <span
              className={styles.emptyIcon}
            >
              ♫
            </span>

            <div>
              <strong>
                Nenhum hino favorito
              </strong>

              <p>
                Os hinos que você favoritar
                aparecerão aqui.
              </p>
            </div>
          </div>
        ) : (
          <div
            className={styles.hymnGrid}
          >
            {hinos.map((item) => (
              <Link
                key={item.id}
                href={`/harpa/${item.hymn.number}`}
                className={`${styles.card} ${styles.hymnCard}`}
              >
                <div
                  className={
                    styles.hymnIcon
                  }
                >
                  ♫
                </div>

                <div
                  className={
                    styles.hymnContent
                  }
                >
                  <span>
                    Hino{" "}
                    {item.hymn.number}
                  </span>

                  <strong>
                    {item.hymn.title}
                  </strong>

                  <small>
                    ★ Hino favorito
                  </small>
                </div>

                <span
                  className={
                    styles.openArrow
                  }
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}