// prisma/seed-biblia-kja.ts

import { PrismaClient } from "@prisma/client";
import { LIVROS } from "../lib/biblia-api";
import {
  buscarNumeroCapitulosKja,
  buscarVersiculosKja,
} from "../lib/biblia-api-kja";

const prisma = new PrismaClient();

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function createVersesWithRetry(
  data: Array<{
    chapterId: number;
    translationId: number;
    number: number;
    text: string;
  }>,
  tries = 5,
): Promise<void> {
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      await prisma.verse.createMany({
        data,
        skipDuplicates: true,
      });
      return;
    } catch (error) {
      if (attempt === tries) throw error;

      await prisma.$disconnect().catch(() => {});
      await sleep(1500 * attempt);
      await prisma.$connect();
    }
  }
}

async function main(): Promise<void> {
  await prisma.$connect();
  console.log("📖 Iniciando seed da Bíblia (KJA)");

  const translation = await prisma.translation.upsert({
    where: { code: "kja" },
    update: { name: "King James Atualizada" },
    create: { code: "kja", name: "King James Atualizada" },
  });

  for (const livro of LIVROS) {
    console.log(`📘 Livro: ${livro.name}`);

    const book = await prisma.book.upsert({
      where: { slug: livro.slugDb },
      update: {
        name: livro.name,
        testament: livro.testament,
        order: livro.order,
      },
      create: {
        name: livro.name,
        slug: livro.slugDb,
        testament: livro.testament,
        order: livro.order,
      },
    });

    const total = await buscarNumeroCapitulosKja(livro.slugDb);
    console.log(`   📑 ${total} capítulos`);

    for (let cap = 1; cap <= total; cap++) {
      const verses = await buscarVersiculosKja(livro.slugDb, cap);

      if (verses.length === 0) {
        throw new Error(`KJA vazia: ${livro.slugDb} cap ${cap}`);
      }

      const chapter = await prisma.chapter.upsert({
        where: {
          bookId_number: {
            bookId: book.id,
            number: cap,
          },
        },
        update: {},
        create: {
          bookId: book.id,
          number: cap,
        },
      });

      await createVersesWithRetry(
        verses.map((vv) => ({
          chapterId: chapter.id,
          translationId: translation.id,
          number: vv.number,
          text: vv.text,
        })),
      );

      console.log(`   ✔ Capítulo ${cap} (kja)`);
      await sleep(350);
    }

    await sleep(700);
  }

  console.log("🎉 Seed KJA finalizado!");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("💥 Erro no seed KJA:", err);
  process.exit(1);
});
