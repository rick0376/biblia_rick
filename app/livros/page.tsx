// app/livros/page.tsx

import Link from "next/link";
import { prisma } from "../../lib/prisma";
import styles from "./styles.module.scss";
import LivrosClient from "../components/LivrosClient";
import { requireBibleAuth } from "../../lib/auth/server";

type Version = "acf" | "ara" | "nvi" | "kja";

function normalizeVersion(v?: string): Version {
  const s = (v ?? "").toLowerCase();

  if (
    s === "acf" ||
    s === "ara" ||
    s === "nvi" ||
    s === "kja"
  ) {
    return s;
  }

  return "acf";
}

export default async function Livros({
  searchParams,
}: {
  searchParams?: Promise<{ v?: string }>;
}) {
  const auth = await requireBibleAuth();

  const { v } = (await searchParams) ?? {};
  const version = normalizeVersion(v);

  const translation = await prisma.translation.findUnique({
    where: { code: version },
    select: { id: true },
  });

  if (!translation) {
    return (
      <main className={styles.container}>
        <div className={styles.topArea}>
          <Link href="/" className={styles.backLink}>
            <span className={styles.backIcon}>←</span>
            <span className={styles.backText}>Voltar</span>
          </Link>

          <div className={styles.pageHeading}>
            <div className={styles.headingIcon}>📖</div>

            <div>
              <span className={styles.eyebrow}>
                Biblioteca Bíblica
              </span>

              <h1 className={styles.title}>
                Livros da Bíblia
              </h1>

              <p className={styles.subtitle}>
                Tradução{" "}
                <strong>{version.toUpperCase()}</strong>{" "}
                ainda não foi importada no banco.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const livros = await prisma.book.findMany({
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
                  translationId: translation.id,
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
              translationId: translation.id,

              notes: {
                some: {
                  userId: auth.user.id,
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

  const livrosFormatados = livros.map((l) => ({
    id: l.id,
    name: l.name,
    slug: l.slug,
    testament: l.testament,
    chaptersCount: l._count.chapters,
    hasNotes: l.chapters.length > 0,
  }));

  return (
    <main className={styles.container}>
      <div className={styles.topArea}>
        <Link href="/" className={styles.backLink}>
          <span className={styles.backIcon}>←</span>
          <span className={styles.backText}>Voltar</span>
        </Link>

        <div className={styles.pageHeading}>
          <div className={styles.headingIcon}>
            📖
          </div>

          <div>
            <span className={styles.eyebrow}>
              Biblioteca Bíblica
            </span>

            <h1 className={styles.title}>
              Livros da Bíblia
            </h1>

            <p className={styles.subtitle}>
              Escolha um livro para iniciar sua leitura
              • versão{" "}
              <strong>{version.toUpperCase()}</strong>
            </p>
          </div>

          <div className={styles.versionBadge}>
            📖 {version.toUpperCase()}
          </div>
        </div>
      </div>

      <LivrosClient
        livros={livrosFormatados}
        version={version}
      />
    </main>
  );
}