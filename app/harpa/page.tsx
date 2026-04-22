//app/harpa/page.tsx

export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { prisma } from "../../lib/prisma";
import styles from "./styles.module.scss";
import HarpaClient from "../components/HarpaClient";

export default async function HarpaPage() {
  const hinos = await prisma.hymn.findMany({
    select: { number: true, title: true, _count: { select: { verses: true } } },
    orderBy: { number: "asc" },
  });

  type HinoRow = (typeof hinos)[number];

  const hinosFormatados = hinos.map((h: HinoRow) => ({
    number: h.number,
    title: h.title,
    versesCount: h._count.verses,
  }));

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <Link href="/" className={styles.backBtn} aria-label="Voltar">
            ←
          </Link>

          <div>
            <h1 className={styles.title}>Harpa Cristã</h1>
            <p className={styles.subtitle}>
              Selecione um hino para ver as estrofes.
            </p>
          </div>
        </div>
      </header>

      <HarpaClient hinos={hinosFormatados} styles={styles} />
    </main>
  );
}
