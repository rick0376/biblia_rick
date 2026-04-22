//app/page.tsx

import Link from "next/link";
import { prisma } from "../lib/prisma";
import styles from "./styles.module.scss";

type Version = "acf" | "ara" | "nvi" | "kja";

function normalizeVersion(v?: string): Version {
  const s = (v ?? "").toLowerCase();
  if (s === "acf" || s === "ara" || s === "nvi" || s === "kja") return s;
  return "acf";
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ v?: string }>;
}) {
  const { v } = (await searchParams) ?? {};
  const version = normalizeVersion(v);

  const booksCount = await prisma.book.count();
  const hymnsCount = await prisma.hymn.count();

  return (
    <main className={styles.container}>
      <section className={styles.card}>
        <span className={`${styles.corner} ${styles.cornerTL}`} />
        <span className={`${styles.corner} ${styles.cornerTR}`} />
        <span className={`${styles.corner} ${styles.cornerBL}`} />
        <span className={`${styles.corner} ${styles.cornerBR}`} />

        <div className={styles.inner}>
          <div className={styles.headerRow}>
            <span className={styles.badge}>📜 Leitura • Estudo • Pesquisa</span>
            <span className={styles.badge}>
              ✨ Versão: {version.toUpperCase()}
            </span>
          </div>

          <h1 className={styles.title}>Bíblia Sagrada - LHP</h1>

          <div className={styles.ornament} />

          <p className={styles.subtitle}>
            Uma experiência limpa e rápida para navegar por livros, capítulos,
            versículos e a Harpa Cristã.
          </p>

          <Link
            href="/?v=acf"
            className={`${styles.secondaryBtn} ${version === "acf" ? styles.activeBtn : ""}`}
            aria-current={version === "acf" ? "page" : undefined}
          >
            ACF
          </Link>

          <Link
            href="/?v=ara"
            className={`${styles.secondaryBtn} ${version === "ara" ? styles.activeBtn : ""}`}
            aria-current={version === "ara" ? "page" : undefined}
          >
            ARA
          </Link>

          <Link
            href="/?v=nvi"
            className={`${styles.secondaryBtn} ${version === "nvi" ? styles.activeBtn : ""}`}
            aria-current={version === "nvi" ? "page" : undefined}
          >
            NVI
          </Link>

          <Link
            href="/?v=kja"
            className={`${styles.secondaryBtn} ${version === "kja" ? styles.activeBtn : ""}`}
            aria-current={version === "kja" ? "page" : undefined}
          >
            KJA
          </Link>

          <Link className={styles.secondaryBtn} href="/favoritos">
            ⭐ Favoritos
          </Link>

          <Link className={styles.secondaryBtn} href="/anotacoes">
            📝 Anotações
          </Link>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statLabel}>Livros bíblicos</div>
              <div className={styles.statValue}>{booksCount}</div>
            </div>

            <div className={styles.stat}>
              <div className={styles.statLabel}>Hinos (Harpa)</div>
              <div className={styles.statValue}>{hymnsCount}</div>
            </div>

            <div className={styles.stat}>
              <div className={styles.statLabel}>Autor</div>
              <div className={styles.statValue}>Rick Pereira</div>
            </div>
          </div>

          <div className={styles.actions}>
            <Link className={styles.primaryBtn} href={`/livros?v=${version}`}>
              📖 Bíblia Sagrada →
            </Link>

            <Link className={styles.secondaryBtn} href="/harpa">
              🎵 Harpa ({hymnsCount})
            </Link>

            <Link
              className={styles.secondaryBtn}
              href={`/livros/apocalipse?v=${version}`}
            >
              Ir para Apocalipse
            </Link>
          </div>

          <div className={styles.footerHint}>
            Produzido por: Rick Pereira - whats (12) 99189-0682.
          </div>
        </div>
      </section>
    </main>
  );
}
