import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testConnection() {
  try {
    const result = await prisma.$queryRaw`SELECT 1+1 AS result`;
    console.log("Conexão com o banco de dados bem-sucedida:", result);
  } catch (error) {
    console.error("Erro ao conectar com o banco de dados:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
