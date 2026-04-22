// prisma/seed-biblia.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const BASE_URL = "https://www.abibliadigital.com.br/api";
const TOKEN = process.env.BIBLIA_API_TOKEN;

// ✅ ACF primeiro
const VERSION = "ara" as const;

const API_VERSION = VERSION === "ara" ? "ra" : VERSION;

type ApiBookResponse = { name: string; chapters: number };
type ApiVerse = { number: number; text: string };
type ApiVersesResponse = { verses: ApiVerse[] };

type Testament = "Antigo" | "Novo";

type Livro = {
  name: string;
  slugApi: string;
  slugDb: string;
  testament: Testament;
  order: number;
};

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function assertToken(): void {
  if (!TOKEN) throw new Error("BIBLIA_API_TOKEN não definido no .env");
}

function isRetryableStatus(status: number): boolean {
  return [429, 500, 502, 503, 504].includes(status);
}

async function fetchJsonWithRetry<T>(url: string, tries = 6): Promise<T> {
  assertToken();

  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          Accept: "application/json",
          "User-Agent": "seed-biblia/1.0",
        },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        if (isRetryableStatus(res.status) && attempt < tries) {
          await sleep(900 * 2 ** (attempt - 1));
          continue;
        }
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
      }

      return (await res.json()) as T;
    } catch (err) {
      if (attempt === tries) throw err;
      await sleep(900 * 2 ** (attempt - 1));
    }
  }

  throw new Error("fetchJsonWithRetry falhou");
}

async function buscarNumeroCapitulos(slugApi: string): Promise<number> {
  const data = await fetchJsonWithRetry<ApiBookResponse>(
    `${BASE_URL}/books/${slugApi}`,
  );
  return data.chapters;
}

/**
 * /verses pode retornar 404 "Chapter not found" => pula.
 * retry em 429/5xx.
 */
async function buscarVersiculos(
  slugApi: string,
  chapter: number,
  tries = 6,
): Promise<ApiVerse[]> {
  assertToken();

  //const url = `${BASE_URL}/verses/${VERSION}/${slugApi}/${chapter}`;
  const url = `${BASE_URL}/verses/${API_VERSION}/${slugApi}/${chapter}`;

  for (let attempt = 1; attempt <= tries; attempt++) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/json",
        "User-Agent": "seed-biblia/1.0",
      },
    });

    if (res.status === 404) {
      console.warn(
        `⚠️ Chapter not found → ${slugApi} cap ${chapter} (${VERSION}) – pulando`,
      );
      return [];
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (isRetryableStatus(res.status) && attempt < tries) {
        await sleep(900 * 2 ** (attempt - 1));
        continue;
      }
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
    }

    const data = (await res.json()) as ApiVersesResponse;
    return data.verses;
  }

  throw new Error(
    `Falha ao buscar versículos: ${slugApi} cap ${chapter} (${VERSION})`,
  );
}

// ✅ TODOS os 66 livros
const LIVROS: readonly Livro[] = [
  {
    name: "Gênesis",
    slugApi: "gn",
    slugDb: "genesis",
    testament: "Antigo",
    order: 1,
  },
  {
    name: "Êxodo",
    slugApi: "ex",
    slugDb: "exodo",
    testament: "Antigo",
    order: 2,
  },
  {
    name: "Levítico",
    slugApi: "lv",
    slugDb: "levitico",
    testament: "Antigo",
    order: 3,
  },
  {
    name: "Números",
    slugApi: "nm",
    slugDb: "numeros",
    testament: "Antigo",
    order: 4,
  },
  {
    name: "Deuteronômio",
    slugApi: "dt",
    slugDb: "deuteronomio",
    testament: "Antigo",
    order: 5,
  },
  {
    name: "Josué",
    slugApi: "js",
    slugDb: "josue",
    testament: "Antigo",
    order: 6,
  },
  {
    name: "Juízes",
    slugApi: "jz",
    slugDb: "juizes",
    testament: "Antigo",
    order: 7,
  },
  {
    name: "Rute",
    slugApi: "rt",
    slugDb: "rute",
    testament: "Antigo",
    order: 8,
  },
  {
    name: "1 Samuel",
    slugApi: "1sm",
    slugDb: "1-samuel",
    testament: "Antigo",
    order: 9,
  },
  {
    name: "2 Samuel",
    slugApi: "2sm",
    slugDb: "2-samuel",
    testament: "Antigo",
    order: 10,
  },
  {
    name: "1 Reis",
    slugApi: "1rs",
    slugDb: "1-reis",
    testament: "Antigo",
    order: 11,
  },
  {
    name: "2 Reis",
    slugApi: "2rs",
    slugDb: "2-reis",
    testament: "Antigo",
    order: 12,
  },
  {
    name: "1 Crônicas",
    slugApi: "1cr",
    slugDb: "1-cronicas",
    testament: "Antigo",
    order: 13,
  },
  {
    name: "2 Crônicas",
    slugApi: "2cr",
    slugDb: "2-cronicas",
    testament: "Antigo",
    order: 14,
  },
  {
    name: "Esdras",
    slugApi: "ezr",
    slugDb: "esdras",
    testament: "Antigo",
    order: 15,
  },
  {
    name: "Neemias",
    slugApi: "ne",
    slugDb: "neemias",
    testament: "Antigo",
    order: 16,
  },
  {
    name: "Ester",
    slugApi: "et",
    slugDb: "ester",
    testament: "Antigo",
    order: 17,
  },
  { name: "Jó", slugApi: "job", slugDb: "jo", testament: "Antigo", order: 18 },
  {
    name: "Salmos",
    slugApi: "sl",
    slugDb: "salmos",
    testament: "Antigo",
    order: 19,
  },
  {
    name: "Provérbios",
    slugApi: "pv",
    slugDb: "proverbios",
    testament: "Antigo",
    order: 20,
  },
  {
    name: "Eclesiastes",
    slugApi: "ec",
    slugDb: "eclesiastes",
    testament: "Antigo",
    order: 21,
  },
  {
    name: "Cantares",
    slugApi: "ct",
    slugDb: "cantares",
    testament: "Antigo",
    order: 22,
  },
  {
    name: "Isaías",
    slugApi: "is",
    slugDb: "isaias",
    testament: "Antigo",
    order: 23,
  },
  {
    name: "Jeremias",
    slugApi: "jr",
    slugDb: "jeremias",
    testament: "Antigo",
    order: 24,
  },
  {
    name: "Lamentações",
    slugApi: "lm",
    slugDb: "lamentacoes",
    testament: "Antigo",
    order: 25,
  },
  {
    name: "Ezequiel",
    slugApi: "ez",
    slugDb: "ezequiel",
    testament: "Antigo",
    order: 26,
  },
  {
    name: "Daniel",
    slugApi: "dn",
    slugDb: "daniel",
    testament: "Antigo",
    order: 27,
  },
  {
    name: "Oseias",
    slugApi: "os",
    slugDb: "oseias",
    testament: "Antigo",
    order: 28,
  },
  {
    name: "Joel",
    slugApi: "jl",
    slugDb: "joel",
    testament: "Antigo",
    order: 29,
  },
  {
    name: "Amós",
    slugApi: "am",
    slugDb: "amos",
    testament: "Antigo",
    order: 30,
  },
  {
    name: "Obadias",
    slugApi: "ob",
    slugDb: "obadias",
    testament: "Antigo",
    order: 31,
  },
  {
    name: "Jonas",
    slugApi: "jn",
    slugDb: "jonas",
    testament: "Antigo",
    order: 32,
  },
  {
    name: "Miqueias",
    slugApi: "mq",
    slugDb: "miqueias",
    testament: "Antigo",
    order: 33,
  },
  {
    name: "Naum",
    slugApi: "na",
    slugDb: "naum",
    testament: "Antigo",
    order: 34,
  },
  {
    name: "Habacuque",
    slugApi: "hc",
    slugDb: "habacuque",
    testament: "Antigo",
    order: 35,
  },
  {
    name: "Sofonias",
    slugApi: "sf",
    slugDb: "sofonias",
    testament: "Antigo",
    order: 36,
  },
  {
    name: "Ageu",
    slugApi: "ag",
    slugDb: "ageu",
    testament: "Antigo",
    order: 37,
  },
  {
    name: "Zacarias",
    slugApi: "zc",
    slugDb: "zacarias",
    testament: "Antigo",
    order: 38,
  },
  {
    name: "Malaquias",
    slugApi: "ml",
    slugDb: "malaquias",
    testament: "Antigo",
    order: 39,
  },

  {
    name: "Mateus",
    slugApi: "mt",
    slugDb: "mateus",
    testament: "Novo",
    order: 40,
  },
  {
    name: "Marcos",
    slugApi: "mc",
    slugDb: "marcos",
    testament: "Novo",
    order: 41,
  },
  {
    name: "Lucas",
    slugApi: "lc",
    slugDb: "lucas",
    testament: "Novo",
    order: 42,
  },
  { name: "João", slugApi: "jo", slugDb: "joao", testament: "Novo", order: 43 },
  { name: "Atos", slugApi: "at", slugDb: "atos", testament: "Novo", order: 44 },
  {
    name: "Romanos",
    slugApi: "rm",
    slugDb: "romanos",
    testament: "Novo",
    order: 45,
  },
  {
    name: "1 Coríntios",
    slugApi: "1co",
    slugDb: "1-corintios",
    testament: "Novo",
    order: 46,
  },
  {
    name: "2 Coríntios",
    slugApi: "2co",
    slugDb: "2-corintios",
    testament: "Novo",
    order: 47,
  },
  {
    name: "Gálatas",
    slugApi: "gl",
    slugDb: "galatas",
    testament: "Novo",
    order: 48,
  },
  {
    name: "Efésios",
    slugApi: "ef",
    slugDb: "efesios",
    testament: "Novo",
    order: 49,
  },
  {
    name: "Filipenses",
    slugApi: "fp",
    slugDb: "filipenses",
    testament: "Novo",
    order: 50,
  },
  {
    name: "Colossenses",
    slugApi: "cl",
    slugDb: "colossenses",
    testament: "Novo",
    order: 51,
  },
  {
    name: "1 Tessalonicenses",
    slugApi: "1ts",
    slugDb: "1-tessalonicenses",
    testament: "Novo",
    order: 52,
  },
  {
    name: "2 Tessalonicenses",
    slugApi: "2ts",
    slugDb: "2-tessalonicenses",
    testament: "Novo",
    order: 53,
  },
  {
    name: "1 Timóteo",
    slugApi: "1tm",
    slugDb: "1-timoteo",
    testament: "Novo",
    order: 54,
  },
  {
    name: "2 Timóteo",
    slugApi: "2tm",
    slugDb: "2-timoteo",
    testament: "Novo",
    order: 55,
  },
  { name: "Tito", slugApi: "tt", slugDb: "tito", testament: "Novo", order: 56 },
  {
    name: "Filemom",
    slugApi: "fm",
    slugDb: "filemom",
    testament: "Novo",
    order: 57,
  },
  {
    name: "Hebreus",
    slugApi: "hb",
    slugDb: "hebreus",
    testament: "Novo",
    order: 58,
  },
  {
    name: "Tiago",
    slugApi: "tg",
    slugDb: "tiago",
    testament: "Novo",
    order: 59,
  },
  {
    name: "1 Pedro",
    slugApi: "1pe",
    slugDb: "1-pedro",
    testament: "Novo",
    order: 60,
  },
  {
    name: "2 Pedro",
    slugApi: "2pe",
    slugDb: "2-pedro",
    testament: "Novo",
    order: 61,
  },
  {
    name: "1 João",
    slugApi: "1jo",
    slugDb: "1-joao",
    testament: "Novo",
    order: 62,
  },
  {
    name: "2 João",
    slugApi: "2jo",
    slugDb: "2-joao",
    testament: "Novo",
    order: 63,
  },
  {
    name: "3 João",
    slugApi: "3jo",
    slugDb: "3-joao",
    testament: "Novo",
    order: 64,
  },
  {
    name: "Judas",
    slugApi: "jd",
    slugDb: "judas",
    testament: "Novo",
    order: 65,
  },
  {
    name: "Apocalipse",
    slugApi: "ap",
    slugDb: "apocalipse",
    testament: "Novo",
    order: 66,
  },
] as const;

async function main(): Promise<void> {
  assertToken();

  await prisma.$connect();
  console.log(`📖 Iniciando seed da Bíblia (SOMENTE ${VERSION.toUpperCase()})`);

  const translation = await prisma.translation.upsert({
    where: { code: VERSION },
    update: { name: "Almeida Revista e Atualizada" },
    create: { code: VERSION, name: "Almeida Revista e Atualizada" },
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

    const total = await buscarNumeroCapitulos(livro.slugApi);
    console.log(`   📑 ${total} capítulos`);

    for (let cap = 1; cap <= total; cap++) {
      const chapter = await prisma.chapter.upsert({
        where: { bookId_number: { bookId: book.id, number: cap } },
        update: {},
        create: { bookId: book.id, number: cap },
      });

      const verses = await buscarVersiculos(livro.slugApi, cap);

      if (verses.length > 0) {
        await prisma.verse.createMany({
          data: verses.map((v) => ({
            chapterId: chapter.id,
            translationId: translation.id,
            number: v.number,
            text: v.text,
          })),
          skipDuplicates: true,
        });
      }

      console.log(`   ✔ Capítulo ${cap} (${VERSION})`);
      await sleep(1200);
    }
  }

  console.log("🎉 Seed ARA concluído com sucesso");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("💥 Erro no seed:", e);
  process.exit(1);
});
