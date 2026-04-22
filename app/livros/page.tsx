//app/livros/page.tsx

import Link from "next/link";
import { prisma } from "../../lib/prisma";
import styles from "./styles.module.scss";
import LivrosClient from "../components/LivrosClient";

type Version = "acf" | "ara" | "nvi" | "kja";

function normalizeVersion(v?: string): Version {
  const s = (v ?? "").toLowerCase();
  if (s === "acf" || s === "ara" || s === "nvi" || s === "kja") return s;
  return "acf";
}

export default async function Livros({
  searchParams,
}: {
  searchParams?: Promise<{ v?: string }>;
}) {
  const { v } = (await searchParams) ?? {};
  const version = normalizeVersion(v);

  const translation = await prisma.translation.findUnique({
    where: { code: version },
    select: { id: true },
  });

  if (!translation) {
    return (
      <main className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerRow}>
            <Link href="/" className={styles.backLink} aria-label="Voltar">
              <span className={styles.backIcon}>←</span>
            </Link>

            <div>
              <h1 className={styles.title}>Livros da Bíblia</h1>
              <p className={styles.subtitle}>
                Tradução <b>{version.toUpperCase()}</b> ainda não foi importada
                no banco.
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
              verses: { some: { translationId: translation.id } },
            },
          },
        },
      },
      chapters: {
        where: {
          verses: {
            some: {
              translationId: translation.id,
              note: { isNot: null },
            },
          },
        },
        select: { id: true },
        take: 1,
      },
    },
    orderBy: { order: "asc" },
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
      <div className={styles.header}>
        <div className={styles.headerRow}>
          <Link href="/" className={styles.backLink} aria-label="Voltar">
            <span className={styles.backIcon}>←</span>
          </Link>

          <div>
            <h1 className={styles.title}>Livros da Bíblia</h1>
            <p className={styles.subtitle}>
              Selecione um livro • <b>{version.toUpperCase()}</b>
            </p>
          </div>
        </div>
      </div>

      <LivrosClient livros={livrosFormatados} version={version} />
    </main>
  );
}
