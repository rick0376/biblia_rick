//app/harpa/page.tsx

export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";

import { prisma } from "../../lib/prisma";
import { requireBibleAuth } from "../../lib/auth/server";

import HarpaClient from "../components/HarpaClient";

import styles from "./styles.module.scss";

export default async function HarpaPage() {
  await requireBibleAuth();

  const hinos = await prisma.hymn.findMany({
    select: {
      number: true,
      title: true,

      _count: {
        select: {
          verses: true,
        },
      },
    },

    orderBy: {
      number: "asc",
    },
  });

  type HinoRow = (typeof hinos)[number];

  const hinosFormatados = hinos.map(
    (hino: HinoRow) => ({
      number: hino.number,
      title: hino.title,
      versesCount: hino._count.verses,
    }),
  );

  return (
    <main className={styles.container}>
      <div className={styles.topArea}>
        <Link
          href="/"
          className={styles.backLink}
          aria-label="Voltar"
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
            🎵
          </div>

          <div className={styles.headingContent}>
            <span className={styles.eyebrow}>
              Hinário Cristão
            </span>

            <h1 className={styles.title}>
              Harpa Cristã
            </h1>

            <p className={styles.subtitle}>
              Encontre um hino e acompanhe suas
              estrofes e coros.
            </p>
          </div>

          <div className={styles.headingStats}>
            <div>
              <strong>
                {hinosFormatados.length}
              </strong>

              <span>Hinos</span>
            </div>
          </div>

          <div className={styles.harpaBadge}>
            <span>🎶</span>
            Harpa
          </div>
        </section>
      </div>

      <HarpaClient
        hinos={hinosFormatados}
        styles={styles}
      />
    </main>
  );
}