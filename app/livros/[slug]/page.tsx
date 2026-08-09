//app/livros/[slug]/page.tsx

import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import CapitulosClient from "../../components/CapitulosClient";
import styles from "./styles.module.scss";
import { requireBibleAuth } from "../../../lib/auth/server";

type Version = "acf" | "ara" | "nvi" | "kja";

function normalizeVersion(v?: string): Version {
  if (v === "acf" || v === "ara" || v === "nvi" || v === "kja") {
    return v;
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

  const translation = await prisma.translation.findUnique({
    where: { code: version },
    select: { id: true },
  });

  if (!translation) {
    return <div>Tradução não encontrada</div>;
  }

  const livro = await prisma.book.findUnique({
    where: { slug },

    select: {
      name: true,
      slug: true,

      chapters: {
        where: {
          verses: {
            some: {
              translationId: translation.id,
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
                  translationId: translation.id,
                },
              },
            },
          },

          verses: {
            where: {
              translationId: translation.id,

              notes: {
                some: {
                  userId: auth.user.id,
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
    return <div>Livro não encontrado</div>;
  }

  const chapters = livro.chapters.map((c) => ({
    id: c.id,
    number: c.number,
    versesCount: c._count.verses,
    hasNotes: c.verses.length > 0,
  }));

  return (
    <main className={styles.container}>
      <div className={styles.topArea}>
        <Link
          href={`/livros?v=${version}`}
          className={styles.backLink}
          aria-label="Voltar para livros"
        >
          <span className={styles.backIcon}>←</span>
          <span className={styles.backText}>Voltar</span>
        </Link>

        <div className={styles.pageHeading}>
          <div className={styles.headingIcon}>📖</div>

          <div className={styles.headingContent}>
            <span className={styles.eyebrow}>
              Livro da Bíblia
            </span>

            <h1 className={styles.title}>
              {livro.name}
            </h1>

            <p className={styles.subtitle}>
              Escolha um capítulo para continuar a leitura.
            </p>
          </div>

          <span className={styles.badge}>
            {chapters.length} capítulos • {version.toUpperCase()}
          </span>
        </div>
      </div>

      <CapitulosClient
        slug={livro.slug}
        chapters={chapters}
        version={version}
      />
    </main>
  );
}