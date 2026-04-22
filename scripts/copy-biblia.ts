import "dotenv/config";
import { Client } from "pg";

type TranslationRow = {
  id: number;
  code: string;
  name: string;
};

type BookRow = {
  id: number;
  name: string;
  slug: string;
  testament: string;
  order: number;
};

type ChapterRow = {
  id: number;
  number: number;
  bookId: number;
};

type VerseRow = {
  id: number;
  number: number;
  text: string;
  chapterId: number;
  translationId: number;
};

const OLD_DATABASE_URL = process.env.OLD_DATABASE_URL;
const NEW_DATABASE_URL = process.env.DATABASE_URL;

if (!OLD_DATABASE_URL) {
  throw new Error("OLD_DATABASE_URL não definida no .env");
}

if (!NEW_DATABASE_URL) {
  throw new Error("DATABASE_URL não definida no .env");
}

function buildInsertQuery(
  tableName: string,
  columns: string[],
  rowCount: number,
): string {
  const valuesSql: string[] = [];
  let paramIndex = 1;

  for (let row = 0; row < rowCount; row++) {
    const rowParams: string[] = [];
    for (let col = 0; col < columns.length; col++) {
      rowParams.push(`$${paramIndex++}`);
    }
    valuesSql.push(`(${rowParams.join(", ")})`);
  }

  return `INSERT INTO "${tableName}" (${columns
    .map((c) => `"${c}"`)
    .join(", ")}) VALUES ${valuesSql.join(", ")}`;
}

async function insertMany<T extends Record<string, unknown>>(
  client: Client,
  tableName: string,
  columns: string[],
  rows: T[],
  chunkSize = 1000,
) {
  if (rows.length === 0) return;

  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const values = chunk.flatMap((row) => columns.map((col) => row[col]));
    const query = buildInsertQuery(tableName, columns, chunk.length);
    await client.query(query, values);
    console.log(
      `✔ ${tableName}: ${Math.min(i + chunk.length, rows.length)}/${rows.length}`,
    );
  }
}

async function resetSequence(client: Client, table: string, column = "id") {
  await client.query(`
    SELECT setval(
      pg_get_serial_sequence('"${table}"', '${column}'),
      COALESCE((SELECT MAX("${column}") FROM "${table}"), 1),
      true
    );
  `);
}

async function main() {
  const oldDb = new Client({ connectionString: OLD_DATABASE_URL });
  const newDb = new Client({ connectionString: NEW_DATABASE_URL });

  await oldDb.connect();
  await newDb.connect();

  try {
    console.log("📥 Lendo dados do banco antigo...");

    const translations = (
      await oldDb.query<TranslationRow>(
        `SELECT "id", "code", "name" FROM "Translation" ORDER BY "id" ASC`,
      )
    ).rows;

    const books = (
      await oldDb.query<BookRow>(
        `SELECT "id", "name", "slug", "testament", "order" FROM "Book" ORDER BY "id" ASC`,
      )
    ).rows;

    const chapters = (
      await oldDb.query<ChapterRow>(
        `SELECT "id", "number", "bookId" FROM "Chapter" ORDER BY "id" ASC`,
      )
    ).rows;

    const verses = (
      await oldDb.query<VerseRow>(
        `SELECT "id", "number", "text", "chapterId", "translationId" FROM "Verse" ORDER BY "id" ASC`,
      )
    ).rows;

    console.log("📦 Limpando tabelas do banco novo...");

    await newDb.query(`
      TRUNCATE TABLE "Verse", "Chapter", "Book", "Translation"
      RESTART IDENTITY CASCADE;
    `);

    console.log("📤 Copiando dados para o banco novo...");

    await insertMany(
      newDb,
      "Translation",
      ["id", "code", "name"],
      translations,
      200,
    );
    await insertMany(
      newDb,
      "Book",
      ["id", "name", "slug", "testament", "order"],
      books,
      200,
    );
    await insertMany(
      newDb,
      "Chapter",
      ["id", "number", "bookId"],
      chapters,
      500,
    );
    await insertMany(
      newDb,
      "Verse",
      ["id", "number", "text", "chapterId", "translationId"],
      verses,
      1000,
    );

    console.log("🔧 Ajustando sequences...");
    await resetSequence(newDb, "Translation");
    await resetSequence(newDb, "Book");
    await resetSequence(newDb, "Chapter");
    await resetSequence(newDb, "Verse");

    console.log("✅ Cópia concluída com sucesso!");
    console.log(`Translations: ${translations.length}`);
    console.log(`Books: ${books.length}`);
    console.log(`Chapters: ${chapters.length}`);
    console.log(`Verses: ${verses.length}`);
  } finally {
    await oldDb.end();
    await newDb.end();
  }
}

main().catch((error) => {
  console.error("💥 Erro na cópia:", error);
  process.exit(1);
});
