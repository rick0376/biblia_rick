//app/harpa/[numero]/page.tsx

import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import styles from "./styles.module.scss";
import HinoClient from "../../components/HinoClient";

export default async function HinoPage({
  params,
}: {
  params: Promise<{ numero: string }>;
}) {
  const { numero } = await params;
  const n = Number(numero);

  if (!Number.isFinite(n) || n <= 0) {
    return <h1>Hino inválido</h1>;
  }

  const hino = await prisma.hymn.findUnique({
    where: { number: n },
    select: {
      id: true,
      number: true,
      title: true,
      favorite: {
        select: { id: true },
      },
      verses: {
        orderBy: { position: "asc" },
        select: {
          id: true,
          type: true,
          number: true,
          text: true,
        },
      },
    },
  });

  if (!hino) {
    return <h1>Hino não encontrado</h1>;
  }

  return (
    <main className={styles.container}>
      <header className={styles.headerRow}>
        <Link href="/harpa" className={styles.backBtn} aria-label="Voltar">
          ←
        </Link>

        <div>
          <h1 className={styles.title}>
            {hino.number}. {hino.title}
          </h1>
          <p className={styles.subtitle}>{hino.verses.length} estrofes</p>
        </div>
      </header>

      <HinoClient
        hymnId={hino.id}
        hymnNumber={hino.number}
        hymnTitle={hino.title}
        isFavorite={Boolean(hino.favorite)}
        verses={hino.verses}
        styles={styles}
      />
    </main>
  );
}
