//app/livros/[slug]/page.tsx

import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import CapitulosClient from "../../components/CapitulosClient";
import styles from "./styles.module.scss";

type Version = "acf" | "ara" | "nvi" | "kja";

function normalizeVersion(v?: string): Version {
  if (v === "acf" || v === "ara" || v === "nvi" || v === "kja") return v;
  return "acf";
}

export default async function LivroPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ v?: string }>;
}) {
  const { slug } = await params;
  const { v } = (await searchParams) ?? {};
  const version = normalizeVersion(v);

  const translation = await prisma.translation.findUnique({
    where: { code: version },
    select: { id: true },
  });

  if (!translation) return <h1>Tradução não encontrada</h1>;

  const livro = await prisma.book.findUnique({
    where: { slug },
    select: {
      name: true,
      slug: true,
      chapters: {
        where: {
          verses: { some: { translationId: translation.id } },
        },
        select: {
          id: true,
          number: true,
          _count: {
            select: {
              verses: {
                where: { translationId: translation.id },
              },
            },
          },
          verses: {
            where: {
              translationId: translation.id,
              note: { isNot: null },
            },
            select: { id: true },
            take: 1,
          },
        },
        orderBy: { number: "asc" },
      },
    },
  });

  if (!livro) return <h1>Livro não encontrado</h1>;

  const chapters = livro.chapters.map((c) => ({
    id: c.id,
    number: c.number,
    versesCount: c._count.verses,
    hasNotes: c.verses.length > 0,
  }));

  return (
    <main className={styles.container}>
      <Link
        href={`/livros?v=${version}`}
        className={styles.backLink}
        aria-label="Voltar para livros"
      >
        <span className={styles.backIcon}>←</span>
        <span className={styles.backText}>Voltar</span>
      </Link>

      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>{livro.name}</h1>
          <p className={styles.subtitle}>Escolha um capítulo</p>
        </div>

        <span className={styles.badge}>
          {chapters.length} capítulos • {version.toUpperCase()}
        </span>
      </div>

      <CapitulosClient
        slug={livro.slug}
        chapters={chapters}
        version={version}
      />
    </main>
  );
}
