// app/livros/page.tsx

import Link from "next/link";

import { prisma } from "../../lib/prisma";
import { requireBibleAuth } from "../../lib/auth/server";

import LivrosClient from "../components/LivrosClient";

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

function normalizeTestament(
  testament: string,
): "OLD" | "NEW" | null {
  const value = String(testament)
    .trim()
    .toUpperCase();

  if (
    value === "OLD" ||
    value === "OT" ||
    value === "AT" ||
    value === "ANTIGO" ||
    value === "OLD_TESTAMENT"
  ) {
    return "OLD";
  }

  if (
    value === "NEW" ||
    value === "NT" ||
    value === "NOVO" ||
    value === "NEW_TESTAMENT"
  ) {
    return "NEW";
  }

  return null;
}

export default async function Livros({
  searchParams,
}: {
  searchParams?: Promise<{
    v?: string;
  }>;
}) {
  const auth =
    await requireBibleAuth();

  const { v } =
    (await searchParams) ?? {};

  const version =
    normalizeVersion(v);

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
          <div className={styles.topBar}>
            <Link
              href="/"
              className={styles.backLink}
            >
              <span
                className={styles.backIcon}
              >
                ←
              </span>

              <span
                className={styles.backText}
              >
                Voltar
              </span>
            </Link>
          </div>

          <section
            className={
              styles.pageHeading
            }
          >
            <div
              className={
                styles.headingIcon
              }
            >
              📖
            </div>

            <div
              className={
                styles.headingContent
              }
            >
              <span
                className={styles.eyebrow}
              >
                Biblioteca Bíblica
              </span>

              <h1
                className={styles.title}
              >
                Livros da Bíblia
              </h1>

              <p
                className={
                  styles.subtitle
                }
              >
                A tradução{" "}
                <strong>
                  {version.toUpperCase()}
                </strong>{" "}
                ainda não foi importada
                no banco de dados.
              </p>
            </div>

            <div
              className={
                styles.versionBadge
              }
            >
              <span>📖</span>

              <strong>
                {version.toUpperCase()}
              </strong>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const livros =
    await prisma.book.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        testament: true,

        _count: {
          select: {
            chapters: {
              where: {
                verses: {
                  some: {
                    translationId:
                      translation.id,
                  },
                },
              },
            },
          },
        },

        chapters: {
          where: {
            verses: {
              some: {
                translationId:
                  translation.id,

                notes: {
                  some: {
                    userId:
                      auth.user.id,
                  },
                },
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
        order: "asc",
      },
    });

  const livrosFormatados =
    livros.map((livro) => ({
      id: livro.id,
      name: livro.name,
      slug: livro.slug,
      testament: livro.testament,

      chaptersCount:
        livro._count.chapters,

      hasNotes:
        livro.chapters.length > 0,
    }));

  const antigoTestamento =
    livrosFormatados.filter(
      (livro) =>
        normalizeTestament(
          String(livro.testament),
        ) === "OLD",
    ).length;

  const novoTestamento =
    livrosFormatados.filter(
      (livro) =>
        normalizeTestament(
          String(livro.testament),
        ) === "NEW",
    ).length;

  return (
    <main className={styles.container}>
      <div className={styles.topArea}>
        <div className={styles.topBar}>
          <Link
            href="/"
            className={styles.backLink}
          >
            <span
              className={styles.backIcon}
            >
              ←
            </span>

            <span
              className={styles.backText}
            >
              Voltar
            </span>
          </Link>
        </div>

        <section
          className={styles.pageHeading}
        >
          <div
            className={styles.headingIcon}
          >
            📖
          </div>

          <div
            className={
              styles.headingContent
            }
          >
            <span
              className={styles.eyebrow}
            >
              Biblioteca Bíblica
            </span>

            <h1 className={styles.title}>
              Livros da Bíblia
            </h1>

            <p
              className={styles.subtitle}
            >
              Escolha um livro e continue
              sua jornada pelas Escrituras
              na versão{" "}
              <strong>
                {version.toUpperCase()}
              </strong>
              .
            </p>
          </div>

          <div
            className={styles.headingStats}
          >
            <div>
              <strong>
                {livrosFormatados.length}
              </strong>

              <span>Livros</span>
            </div>

            <div>
              <strong>
                {antigoTestamento}
              </strong>

              <span>Antigo</span>
            </div>

            <div>
              <strong>
                {novoTestamento}
              </strong>

              <span>Novo</span>
            </div>
          </div>

          <div
            className={
              styles.versionBadge
            }
          >
            <span>📖</span>

            <strong>
              {version.toUpperCase()}
            </strong>
          </div>
        </section>
      </div>

      <LivrosClient
        livros={livrosFormatados}
        version={version}
      />
    </main>
  );
}