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
            Desenvolvido por Rick Pereira • (12) 99189-0682{"   "}
            <a
              href="https://wa.me/5512991890682"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              title="WhatsApp"
              className={styles.whatsIcon}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                width="28"
                height="28"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M19.11 17.21c-.27-.14-1.61-.79-1.86-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.31.2-.58.07-.27-.14-1.12-.41-2.14-1.3-.79-.7-1.33-1.56-1.49-1.83-.16-.27-.02-.42.12-.56.13-.13.27-.31.41-.47.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.47-.07-.14-.61-1.47-.84-2.02-.22-.53-.45-.45-.61-.46h-.52c-.18 0-.47.07-.72.34-.25.27-.95.93-.95 2.27s.97 2.64 1.11 2.82c.14.18 1.9 2.9 4.6 4.07.64.27 1.14.43 1.53.55.64.2 1.22.17 1.68.1.51-.08 1.61-.66 1.84-1.3.23-.64.23-1.18.16-1.3-.07-.11-.25-.18-.52-.32z" />
                <path d="M16.02 3.2c-7.05 0-12.78 5.72-12.78 12.76 0 2.24.59 4.43 1.7 6.35L3.2 28.8l6.66-1.74a12.8 12.8 0 0 0 6.16 1.57h.01c7.04 0 12.77-5.72 12.77-12.77 0-3.41-1.33-6.62-3.75-9.03A12.68 12.68 0 0 0 16.02 3.2zm0 23.28h-.01a10.62 10.62 0 0 1-5.41-1.48l-.39-.23-3.95 1.03 1.05-3.85-.25-.4a10.55 10.55 0 0 1-1.62-5.66c0-5.84 4.75-10.59 10.59-10.59 2.83 0 5.49 1.1 7.49 3.1a10.5 10.5 0 0 1 3.1 7.49c0 5.84-4.75 10.59-10.6 10.59z" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
