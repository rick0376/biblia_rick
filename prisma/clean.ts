// prisma/clean.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanAll() {
  console.log("🧹 Limpando todas as tabelas...");

  // Apaga do mais "filho" para o mais "pai"
  await prisma.verse.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.book.deleteMany();
  await prisma.translation.deleteMany();

  console.log("✅ Banco limpo com sucesso.");
}

cleanAll()
  .catch((e) => {
    console.error("💥 Erro ao limpar:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
