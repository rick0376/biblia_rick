//app/anotacoes/page.tsx

import Link from "next/link";

import { prisma } from "../../lib/prisma";
import { requireBibleAuth } from "../../lib/auth/server";

import styles from "./styles.module.scss";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AnotacoesPage() {
  const auth = await requireBibleAuth();

  const anotacoes = await prisma.verseNote.findMany({
    where: {
      userId: auth.user.id,
    },

    orderBy: {
      updatedAt: "desc",
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
  });

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
            📝
          </div>

          <div className={styles.headingContent}>
            <span className={styles.eyebrow}>
              Estudos pessoais
            </span>

            <h1 className={styles.title}>
              Anotações
            </h1>

            <p className={styles.subtitle}>
              Consulte suas reflexões e estudos
              registrados durante a leitura bíblica.
            </p>
          </div>

          <div className={styles.headingStats}>
            <div>
              <strong>
                {anotacoes.length}
              </strong>

              <span>Anotações</span>
            </div>
          </div>

          <div className={styles.notesBadge}>
            <span>📝</span>
            Estudos
          </div>
        </section>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.sectionEyebrow}>
              Suas reflexões
            </span>

            <h2 className={styles.sectionTitle}>
              Versículos anotados
            </h2>
          </div>

          <span className={styles.sectionCount}>
            {anotacoes.length}
          </span>
        </div>

        {anotacoes.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>
              📝
            </span>

            <div>
              <strong>
                Nenhuma anotação ainda
              </strong>

              <p>
                As anotações criadas durante a
                leitura aparecerão aqui.
              </p>
            </div>
          </div>
        ) : (
          <div className={styles.grid}>
            {anotacoes.map((item) => {
              const verse = item.verse;
              const chapter = verse.chapter;
              const book = chapter.book;
              const version =
                verse.translation.code;

              return (
                <Link
                  key={item.id}
                  href={`/livros/${book.slug}/${chapter.number}?v=${version}#v-${verse.number}`}
                  className={styles.card}
                >
                  <div className={styles.cardTop}>
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
                          Versículo anotado
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

                  <p className={styles.verseText}>
                    {verse.text}
                  </p>

                  <div className={styles.noteBox}>
                    <div
                      className={
                        styles.noteHeader
                      }
                    >
                      <span
                        className={
                          styles.noteIcon
                        }
                      >
                        📝
                      </span>

                      <strong>
                        Sua anotação
                      </strong>
                    </div>

                    <div
                      className={
                        styles.noteText
                      }
                    >
                      {item.content}
                    </div>
                  </div>

                  <div className={styles.cardFooter}>
                    <span>
                      Clique para voltar ao
                      versículo
                    </span>

                    <strong>
                      Abrir passagem →
                    </strong>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}