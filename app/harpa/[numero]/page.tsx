// app/harpa/[numero]/page.tsx

import Link from "next/link";

import { prisma } from "../../../lib/prisma";
import { requireBibleAuth } from "../../../lib/auth/server";

import HinoClient from "../../components/HinoClient";

import styles from "./styles.module.scss";

export default async function HinoPage({
  params,
}: {
  params: Promise<{ numero: string }>;
}) {
  const auth = await requireBibleAuth();

  const { numero } = await params;

  const n = Number(numero);

  if (!Number.isFinite(n) || n <= 0) {
    return <h1>Hino inválido</h1>;
  }

  const hino = await prisma.hymn.findUnique({
    where: {
      number: n,
    },

    select: {
      id: true,
      number: true,
      title: true,

      favorites: {
        where: {
          userId: auth.user.id,
        },

        select: {
          id: true,
        },
      },

      verses: {
        orderBy: {
          position: "asc",
        },

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

  const totalEstrofes = hino.verses.filter(
    (verse) => verse.type === "VERSE",
  ).length;

  const totalCoros = hino.verses.filter(
    (verse) => verse.type === "CHORUS",
  ).length;

  return (
    <main className={styles.container}>
      <div className={styles.topArea}>
        <Link
          href="/harpa"
          className={styles.backLink}
          aria-label="Voltar para Harpa Cristã"
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
              Harpa Cristã
            </span>

            <h1 className={styles.title}>
              {hino.number}. {hino.title}
            </h1>

            <p className={styles.subtitle}>
              Acompanhe a letra completa deste hino,
              suas estrofes e coro.
            </p>
          </div>

          <div className={styles.headingStats}>
            <div>
              <strong>{hino.number}</strong>
              <span>Hino</span>
            </div>

            <div>
              <strong>{totalEstrofes}</strong>
              <span>Estrofes</span>
            </div>

            <div>
              <strong>{totalCoros}</strong>
              <span>Coros</span>
            </div>
          </div>

          <div className={styles.harpaBadge}>
            <span>🎶</span>
            Harpa
          </div>
        </section>
      </div>

      <HinoClient
        hymnId={hino.id}
        hymnNumber={hino.number}
        hymnTitle={hino.title}
        isFavorite={hino.favorites.length > 0}
        verses={hino.verses}
        styles={styles}
        canAddFavorites={
          auth.permissions.add_favorites === true
        }
      />
    </main>
  );
}