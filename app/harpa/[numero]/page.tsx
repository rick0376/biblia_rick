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

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <Link
          href="/harpa"
          className={styles.backLink}
        >
          ←
        </Link>

        <div>
          <h1 className={styles.title}>
            {hino.number}. {hino.title}
          </h1>

          <p className={styles.subtitle}>
            {hino.verses.length} estrofes
          </p>
        </div>
      </header>

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