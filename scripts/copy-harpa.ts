//rode: npx tsx scripts/copy-harpa.ts

import "dotenv/config";
import { Client } from "pg";

type HymnRow = {
  id: number;
  number: number;
  title: string;
  chorus: string | null;
};

type HymnVerseRow = {
  id: number;
  hymnId: number;
  number: number;
  text: string;
  type: "VERSE" | "CHORUS";
  position: number;
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
    console.log("📥 Lendo dados da Harpa do banco antigo...");

    const hymns = (
      await oldDb.query<HymnRow>(
        `SELECT "id", "number", "title", "chorus" FROM "Hymn" ORDER BY "id" ASC`,
      )
    ).rows;

    const hymnVerses = (
      await oldDb.query<HymnVerseRow>(
        `SELECT "id", "hymnId", "number", "text", "type", "position" FROM "HymnVerse" ORDER BY "id" ASC`,
      )
    ).rows;

    console.log("📦 Limpando tabelas da Harpa no banco novo...");

    await newDb.query(`
      TRUNCATE TABLE "HymnVerse", "Hymn"
      RESTART IDENTITY CASCADE;
    `);

    console.log("📤 Copiando Harpa para o banco novo...");

    await insertMany(
      newDb,
      "Hymn",
      ["id", "number", "title", "chorus"],
      hymns,
      200,
    );

    await insertMany(
      newDb,
      "HymnVerse",
      ["id", "hymnId", "number", "text", "type", "position"],
      hymnVerses,
      1000,
    );

    console.log("🔧 Ajustando sequences...");
    await resetSequence(newDb, "Hymn");
    await resetSequence(newDb, "HymnVerse");

    console.log("✅ Cópia da Harpa concluída com sucesso!");
    console.log(`Hymns: ${hymns.length}`);
    console.log(`HymnVerses: ${hymnVerses.length}`);
  } finally {
    await oldDb.end();
    await newDb.end();
  }
}

main().catch((error) => {
  console.error("💥 Erro na cópia da Harpa:", error);
  process.exit(1);
});
