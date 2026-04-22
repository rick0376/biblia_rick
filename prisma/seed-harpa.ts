import fs from "node:fs";
import path from "node:path";
import { prisma } from "../lib/prisma";

type HarpaJsonRoot = Record<string, unknown>;

type HarpaJsonHino = {
  hino: string; // "1 - Chuvas de Graça"
  coro?: string; // html <br>
  verses: Record<string, string>;
};

function normalizeHtml(text: string): string {
  return text
    .replaceAll("<br />", "\n")
    .replaceAll("<br/>", "\n")
    .replaceAll("<br>", "\n")
    .replaceAll("&nbsp;", " ")
    .trim();
}

function parseHinoTitle(hinoField: string): { number: number; title: string } {
  const m = hinoField.match(/^\s*(\d+)\s*[-–]\s*(.+?)\s*$/);
  if (!m) throw new Error(`Formato inválido em "hino": ${hinoField}`);
  return { number: Number(m[1]), title: m[2].trim() };
}

function loadHarpa(): HarpaJsonHino[] {
  const filePath = path.join(process.cwd(), "data", "harpa", "harpa.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const data: unknown = JSON.parse(raw);

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error(
      "harpa.json precisa ser um objeto { '1': {...}, '2': {...} }",
    );
  }

  const root = data as HarpaJsonRoot;
  const items: HarpaJsonHino[] = [];

  for (const [key, value] of Object.entries(root)) {
    if (key === "-1") continue;

    if (typeof value !== "object" || value === null || Array.isArray(value))
      continue;
    const obj = value as Record<string, unknown>;

    const hino = obj.hino;
    const coro = obj.coro;
    const verses = obj.verses;

    if (typeof hino !== "string") continue;
    if (typeof verses !== "object" || verses === null || Array.isArray(verses))
      continue;

    items.push({
      hino,
      coro: typeof coro === "string" ? coro : undefined,
      verses: verses as Record<string, string>,
    });
  }

  items.sort(
    (a, b) => parseHinoTitle(a.hino).number - parseHinoTitle(b.hino).number,
  );
  return items;
}

async function main() {
  console.log("🎵 Seed Harpa: coro ENTRE os versos");

  const hinos = loadHarpa();
  console.log(`📦 Total de hinos: ${hinos.length}`);

  for (const h of hinos) {
    const { number, title } = parseHinoTitle(h.hino);

    const hymn = await prisma.hymn.create({
      data: { number, title },
    });

    // estrofes ordenadas
    const verses = Object.entries(h.verses)
      .map(([k, v]) => ({ n: Number(k), text: normalizeHtml(String(v)) }))
      .filter((x) => Number.isFinite(x.n) && x.n > 0)
      .sort((a, b) => a.n - b.n);

    const chorus = h.coro ? normalizeHtml(h.coro) : null;

    /**
     * Regra: coro entre os versos.
     * Exemplo: 1, coro, 2, coro, 3, coro...
     * Se não tiver coro, fica só 1..N.
     */
    const parts: {
      hymnId: number;
      number: number;
      text: string;
      type: "VERSE" | "CHORUS";
      position: number;
    }[] = [];

    let pos = 1;
    for (const v of verses) {
      parts.push({
        hymnId: hymn.id,
        number: v.n,
        text: v.text,
        type: "VERSE",
        position: pos++,
      });

      if (chorus) {
        parts.push({
          hymnId: hymn.id,
          // number precisa ser único por hino. usamos 1000+pos pra não bater com 1..N
          number: 1000 + pos,
          text: chorus,
          type: "CHORUS",
          position: pos++,
        });
      }
    }

    if (parts.length) {
      await prisma.hymnVerse.createMany({ data: parts });
    }

    console.log(
      `✅ Hino ${number} - ${title} | versos: ${verses.length} | coro: ${chorus ? "sim" : "não"}`,
    );
  }

  console.log("🎉 Harpa importada!");
}

main()
  .catch((e) => {
    console.error("💥 Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
