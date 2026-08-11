//app/livros/[slug]/page.tsx

import Link from "next/link";

import { prisma } from "../../../lib/prisma";
import { requireBibleAuth } from "../../../lib/auth/server";

import CapitulosClient from "../../components/CapitulosClient";

import styles from "./styles.module.scss";

type Version = "acf" | "ara" | "nvi" | "kja";

function normalizeVersion(v?: string): Version {
  const value = (v ?? "").toLowerCase();

  if (
    value === "acf" ||
    value === "ara" ||
    value === "nvi" ||
    value === "kja"
  ) {
    return value;
  }

  return "acf";
}

export default async function LivroPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ v?: string }>;
}) {
  const auth = await requireBibleAuth();

  const { slug } = await params;
  const { v } = (await searchParams) ?? {};

  const version = normalizeVersion(v);

  const translation =
    await prisma.translation.findUnique({
      where: {
        code: version,
      },

      select: {
        id: true,
      },
    });

  if (!translation) {
    return (
      <main className={styles.container}>
        <div className={styles.topArea}>
          <Link
            href={`/livros?v=${version}`}
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
              📖
            </div>

            <div className={styles.headingContent}>
              <span className={styles.eyebrow}>
                Livro da Bíblia
              </span>

              <h1 className={styles.title}>
                Tradução indisponível
              </h1>

              <p className={styles.subtitle}>
                A tradução{" "}
                <strong>
                  {version.toUpperCase()}
                </strong>{" "}
                ainda não está disponível.
              </p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const livro =
    await prisma.book.findUnique({
      where: {
        slug,
      },

      select: {
        name: true,
        slug: true,

        chapters: {
          where: {
            verses: {
              some: {
                translationId:
                  translation.id,
              },
            },
          },

          select: {
            id: true,
            number: true,

            _count: {
              select: {
                verses: {
                  where: {
                    translationId:
                      translation.id,
                  },
                },
              },
            },

            verses: {
              where: {
                translationId:
                  translation.id,

                notes: {
                  some: {
                    userId:
                      auth.user.id,
                  },
                },
              },

              select: {
                id: true,
              },

              take: 1,
            },
          },

          orderBy: {
            number: "asc",
          },
        },
      },
    });

  if (!livro) {
    return (
      <main className={styles.container}>
        <div className={styles.topArea}>
          <Link
            href={`/livros?v=${version}`}
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
              📖
            </div>

            <div className={styles.headingContent}>
              <span className={styles.eyebrow}>
                Biblioteca Bíblica
              </span>

              <h1 className={styles.title}>
                Livro não encontrado
              </h1>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const chapters = livro.chapters.map(
    (chapter) => ({
      id: chapter.id,
      number: chapter.number,
      versesCount:
        chapter._count.verses,
      hasNotes:
        chapter.verses.length > 0,
    }),
  );

  const totalVerses = chapters.reduce(
    (total, chapter) =>
      total + chapter.versesCount,
    0,
  );

  const chaptersWithNotes =
    chapters.filter(
      (chapter) => chapter.hasNotes,
    ).length;

  return (
    <main className={styles.container}>
      <div className={styles.topArea}>
        <div className={styles.topBar}>
          <Link
            href={`/livros?v=${version}`}
            className={styles.backLink}
            aria-label="Voltar para livros"
          >
            <span className={styles.backIcon}>
              ←
            </span>

            <span className={styles.backText}>
              Voltar
            </span>
          </Link>
        </div>

        <section className={styles.pageHeading}>
          <div className={styles.headingIcon}>
            📖
          </div>

          <div className={styles.headingContent}>
            <span className={styles.eyebrow}>
              Livro da Bíblia
            </span>

            <h1 className={styles.title}>
              {livro.name}
            </h1>

            <p className={styles.subtitle}>
              Escolha um capítulo para
              continuar sua leitura na versão{" "}
              <strong>
                {version.toUpperCase()}
              </strong>
              .
            </p>
          </div>

          <div className={styles.headingStats}>
            <div>
              <strong>
                {chapters.length}
              </strong>

              <span>Capítulos</span>
            </div>

            <div>
              <strong>
                {totalVerses}
              </strong>

              <span>Versículos</span>
            </div>

            <div>
              <strong>
                {chaptersWithNotes}
              </strong>

              <span>Anotados</span>
            </div>
          </div>

          <div className={styles.versionBadge}>
            <span>📖</span>

            <strong>
              {version.toUpperCase()}
            </strong>
          </div>
        </section>
      </div>

      <CapitulosClient
        slug={livro.slug}
        chapters={chapters}
        version={version}
      />
    </main>
  );
}