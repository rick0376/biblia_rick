// lib/biblia-api.ts
const BASE_URL = "https://www.abibliadigital.com.br/api";
const TOKEN = process.env.BIBLIA_API_TOKEN;

export type Version = "nvi" | "ara" | "acf";

export type Testament = "Antigo" | "Novo";

export type ApiVerse = {
  number: number;
  text: string;
};

export type ApiVersesResponse = {
  verses: ApiVerse[];
};

export type ApiBookResponse = {
  name: string;
  chapters: number;
  abbrev?: { pt: string; en: string };
  author?: string;
  group?: string;
  version?: string;
};

export type LivroInfo = {
  order: number;
  name: string; // nome PT-BR
  slugDb: string; // slug do seu app/banco
  slugApi: string; // abbrev da ABíbliaDigital
  testament: Testament;
};

/* ======================================================
   MAPA COMPLETO (66 livros) - slug do app -> abbrev API
====================================================== */

export const mapaLivros: Record<string, string> = {
  // AT
  genesis: "gn",
  exodo: "ex",
  levitico: "lv",
  numeros: "nm",
  deuteronomio: "dt",
  josue: "js",
  juizes: "jz",
  rute: "rt",
  "1-samuel": "1sm",
  "2-samuel": "2sm",
  "1-reis": "1rs",
  "2-reis": "2rs",
  "1-cronicas": "1cr",
  "2-cronicas": "2cr",
  esdras: "ezr",
  neemias: "ne",
  ester: "et",
  jo: "job",
  salmos: "sl",
  proverbios: "pv",
  eclesiastes: "ec",
  cantares: "ct",
  isaias: "is",
  jeremias: "jr",
  lamentacoes: "lm",
  ezequiel: "ez",
  daniel: "dn",
  oseias: "os",
  joel: "jl",
  amos: "am",
  obadias: "ob",
  jonas: "jn",
  miqueias: "mq",
  naum: "na",
  habacuque: "hc",
  sofonias: "sf",
  ageu: "ag",
  zacarias: "zc",
  malaquias: "ml",

  // NT
  mateus: "mt",
  marcos: "mc",
  lucas: "lc",
  joao: "jo",
  atos: "at",
  romanos: "rm",
  "1-corintios": "1co",
  "2-corintios": "2co",
  galatas: "gl",
  efesios: "ef",
  filipenses: "fp",
  colossenses: "cl",
  "1-tessalonicenses": "1ts",
  "2-tessalonicenses": "2ts",
  "1-timoteo": "1tm",
  "2-timoteo": "2tm",
  tito: "tt",
  filemom: "fm",
  hebreus: "hb",
  tiago: "tg",
  "1-pedro": "1pe",
  "2-pedro": "2pe",
  "1-joao": "1jo",
  "2-joao": "2jo",
  "3-joao": "3jo",
  judas: "jd",
  apocalipse: "ap",
};

/* ======================================================
   LISTA COMPLETA COM METADADOS (ordem/nome/testamento)
====================================================== */

export const LIVROS: readonly LivroInfo[] = [
  {
    order: 1,
    name: "Gênesis",
    slugDb: "genesis",
    slugApi: "gn",
    testament: "Antigo",
  },
  {
    order: 2,
    name: "Êxodo",
    slugDb: "exodo",
    slugApi: "ex",
    testament: "Antigo",
  },
  {
    order: 3,
    name: "Levítico",
    slugDb: "levitico",
    slugApi: "lv",
    testament: "Antigo",
  },
  {
    order: 4,
    name: "Números",
    slugDb: "numeros",
    slugApi: "nm",
    testament: "Antigo",
  },
  {
    order: 5,
    name: "Deuteronômio",
    slugDb: "deuteronomio",
    slugApi: "dt",
    testament: "Antigo",
  },
  {
    order: 6,
    name: "Josué",
    slugDb: "josue",
    slugApi: "js",
    testament: "Antigo",
  },
  {
    order: 7,
    name: "Juízes",
    slugDb: "juizes",
    slugApi: "jz",
    testament: "Antigo",
  },
  {
    order: 8,
    name: "Rute",
    slugDb: "rute",
    slugApi: "rt",
    testament: "Antigo",
  },
  {
    order: 9,
    name: "1 Samuel",
    slugDb: "1-samuel",
    slugApi: "1sm",
    testament: "Antigo",
  },
  {
    order: 10,
    name: "2 Samuel",
    slugDb: "2-samuel",
    slugApi: "2sm",
    testament: "Antigo",
  },
  {
    order: 11,
    name: "1 Reis",
    slugDb: "1-reis",
    slugApi: "1rs",
    testament: "Antigo",
  },
  {
    order: 12,
    name: "2 Reis",
    slugDb: "2-reis",
    slugApi: "2rs",
    testament: "Antigo",
  },
  {
    order: 13,
    name: "1 Crônicas",
    slugDb: "1-cronicas",
    slugApi: "1cr",
    testament: "Antigo",
  },
  {
    order: 14,
    name: "2 Crônicas",
    slugDb: "2-cronicas",
    slugApi: "2cr",
    testament: "Antigo",
  },
  {
    order: 15,
    name: "Esdras",
    slugDb: "esdras",
    slugApi: "ezr",
    testament: "Antigo",
  },
  {
    order: 16,
    name: "Neemias",
    slugDb: "neemias",
    slugApi: "ne",
    testament: "Antigo",
  },
  {
    order: 17,
    name: "Ester",
    slugDb: "ester",
    slugApi: "et",
    testament: "Antigo",
  },
  { order: 18, name: "Jó", slugDb: "jo", slugApi: "job", testament: "Antigo" },
  {
    order: 19,
    name: "Salmos",
    slugDb: "salmos",
    slugApi: "sl",
    testament: "Antigo",
  },
  {
    order: 20,
    name: "Provérbios",
    slugDb: "proverbios",
    slugApi: "pv",
    testament: "Antigo",
  },
  {
    order: 21,
    name: "Eclesiastes",
    slugDb: "eclesiastes",
    slugApi: "ec",
    testament: "Antigo",
  },
  {
    order: 22,
    name: "Cantares",
    slugDb: "cantares",
    slugApi: "ct",
    testament: "Antigo",
  },
  {
    order: 23,
    name: "Isaías",
    slugDb: "isaias",
    slugApi: "is",
    testament: "Antigo",
  },
  {
    order: 24,
    name: "Jeremias",
    slugDb: "jeremias",
    slugApi: "jr",
    testament: "Antigo",
  },
  {
    order: 25,
    name: "Lamentações",
    slugDb: "lamentacoes",
    slugApi: "lm",
    testament: "Antigo",
  },
  {
    order: 26,
    name: "Ezequiel",
    slugDb: "ezequiel",
    slugApi: "ez",
    testament: "Antigo",
  },
  {
    order: 27,
    name: "Daniel",
    slugDb: "daniel",
    slugApi: "dn",
    testament: "Antigo",
  },
  {
    order: 28,
    name: "Oseias",
    slugDb: "oseias",
    slugApi: "os",
    testament: "Antigo",
  },
  {
    order: 29,
    name: "Joel",
    slugDb: "joel",
    slugApi: "jl",
    testament: "Antigo",
  },
  {
    order: 30,
    name: "Amós",
    slugDb: "amos",
    slugApi: "am",
    testament: "Antigo",
  },
  {
    order: 31,
    name: "Obadias",
    slugDb: "obadias",
    slugApi: "ob",
    testament: "Antigo",
  },
  {
    order: 32,
    name: "Jonas",
    slugDb: "jonas",
    slugApi: "jn",
    testament: "Antigo",
  },
  {
    order: 33,
    name: "Miqueias",
    slugDb: "miqueias",
    slugApi: "mq",
    testament: "Antigo",
  },
  {
    order: 34,
    name: "Naum",
    slugDb: "naum",
    slugApi: "na",
    testament: "Antigo",
  },
  {
    order: 35,
    name: "Habacuque",
    slugDb: "habacuque",
    slugApi: "hc",
    testament: "Antigo",
  },
  {
    order: 36,
    name: "Sofonias",
    slugDb: "sofonias",
    slugApi: "sf",
    testament: "Antigo",
  },
  {
    order: 37,
    name: "Ageu",
    slugDb: "ageu",
    slugApi: "ag",
    testament: "Antigo",
  },
  {
    order: 38,
    name: "Zacarias",
    slugDb: "zacarias",
    slugApi: "zc",
    testament: "Antigo",
  },
  {
    order: 39,
    name: "Malaquias",
    slugDb: "malaquias",
    slugApi: "ml",
    testament: "Antigo",
  },

  {
    order: 40,
    name: "Mateus",
    slugDb: "mateus",
    slugApi: "mt",
    testament: "Novo",
  },
  {
    order: 41,
    name: "Marcos",
    slugDb: "marcos",
    slugApi: "mc",
    testament: "Novo",
  },
  {
    order: 42,
    name: "Lucas",
    slugDb: "lucas",
    slugApi: "lc",
    testament: "Novo",
  },
  { order: 43, name: "João", slugDb: "joao", slugApi: "jo", testament: "Novo" },
  { order: 44, name: "Atos", slugDb: "atos", slugApi: "at", testament: "Novo" },
  {
    order: 45,
    name: "Romanos",
    slugDb: "romanos",
    slugApi: "rm",
    testament: "Novo",
  },
  {
    order: 46,
    name: "1 Coríntios",
    slugDb: "1-corintios",
    slugApi: "1co",
    testament: "Novo",
  },
  {
    order: 47,
    name: "2 Coríntios",
    slugDb: "2-corintios",
    slugApi: "2co",
    testament: "Novo",
  },
  {
    order: 48,
    name: "Gálatas",
    slugDb: "galatas",
    slugApi: "gl",
    testament: "Novo",
  },
  {
    order: 49,
    name: "Efésios",
    slugDb: "efesios",
    slugApi: "ef",
    testament: "Novo",
  },
  {
    order: 50,
    name: "Filipenses",
    slugDb: "filipenses",
    slugApi: "fp",
    testament: "Novo",
  },
  {
    order: 51,
    name: "Colossenses",
    slugDb: "colossenses",
    slugApi: "cl",
    testament: "Novo",
  },
  {
    order: 52,
    name: "1 Tessalonicenses",
    slugDb: "1-tessalonicenses",
    slugApi: "1ts",
    testament: "Novo",
  },
  {
    order: 53,
    name: "2 Tessalonicenses",
    slugDb: "2-tessalonicenses",
    slugApi: "2ts",
    testament: "Novo",
  },
  {
    order: 54,
    name: "1 Timóteo",
    slugDb: "1-timoteo",
    slugApi: "1tm",
    testament: "Novo",
  },
  {
    order: 55,
    name: "2 Timóteo",
    slugDb: "2-timoteo",
    slugApi: "2tm",
    testament: "Novo",
  },
  { order: 56, name: "Tito", slugDb: "tito", slugApi: "tt", testament: "Novo" },
  {
    order: 57,
    name: "Filemom",
    slugDb: "filemom",
    slugApi: "fm",
    testament: "Novo",
  },
  {
    order: 58,
    name: "Hebreus",
    slugDb: "hebreus",
    slugApi: "hb",
    testament: "Novo",
  },
  {
    order: 59,
    name: "Tiago",
    slugDb: "tiago",
    slugApi: "tg",
    testament: "Novo",
  },
  {
    order: 60,
    name: "1 Pedro",
    slugDb: "1-pedro",
    slugApi: "1pe",
    testament: "Novo",
  },
  {
    order: 61,
    name: "2 Pedro",
    slugDb: "2-pedro",
    slugApi: "2pe",
    testament: "Novo",
  },
  {
    order: 62,
    name: "1 João",
    slugDb: "1-joao",
    slugApi: "1jo",
    testament: "Novo",
  },
  {
    order: 63,
    name: "2 João",
    slugDb: "2-joao",
    slugApi: "2jo",
    testament: "Novo",
  },
  {
    order: 64,
    name: "3 João",
    slugDb: "3-joao",
    slugApi: "3jo",
    testament: "Novo",
  },
  {
    order: 65,
    name: "Judas",
    slugDb: "judas",
    slugApi: "jd",
    testament: "Novo",
  },
  {
    order: 66,
    name: "Apocalipse",
    slugDb: "apocalipse",
    slugApi: "ap",
    testament: "Novo",
  },
] as const;

/* ======================================================
   HELPERS
====================================================== */

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

function assertToken(): void {
  if (!TOKEN) throw new Error("BIBLIA_API_TOKEN não definido no .env");
}

function isRetryableStatus(status: number): boolean {
  return [429, 500, 502, 503, 504].includes(status);
}

async function fetchJsonWithRetry<T>(url: string, tries = 5): Promise<T> {
  assertToken();

  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          Accept: "application/json",
          "User-Agent": "biblia-api/1.0",
        },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        if (isRetryableStatus(res.status) && attempt < tries) {
          await sleep(800 * 2 ** (attempt - 1));
          continue;
        }
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
      }

      return (await res.json()) as T;
    } catch (err) {
      if (attempt === tries) throw err;
      await sleep(800 * 2 ** (attempt - 1));
    }
  }

  throw new Error("fetchJsonWithRetry falhou");
}

function getSlugApi(slugDb: string): string | null {
  return mapaLivros[slugDb.toLowerCase()] ?? null;
}

/* ======================================================
   FUNÇÕES PÚBLICAS
====================================================== */

/** Lista os 66 livros com info (ordem/testamento/slugApi/slugDb) */
export function listarLivros(): readonly LivroInfo[] {
  return LIVROS;
}

/** Busca metadados do livro na API (inclui número de capítulos) */
export async function buscarLivroApi(
  slugDb: string,
): Promise<ApiBookResponse | null> {
  const slugApi = getSlugApi(slugDb);
  if (!slugApi) return null;

  return fetchJsonWithRetry<ApiBookResponse>(`${BASE_URL}/books/${slugApi}`);
}

/** Retorna o número de capítulos do livro */
export async function buscarNumeroCapitulos(
  slugDb: string,
): Promise<number | null> {
  const livro = await buscarLivroApi(slugDb);
  return livro?.chapters ?? null;
}

/**
 * Busca os versículos de um capítulo.
 * - 404 "Chapter not found" => retorna []
 * - retry em 429/5xx
 */
export async function buscarVersiculos(
  slugDb: string,
  capitulo: number,
  version: Version,
  tries = 5,
): Promise<ApiVerse[] | null> {
  const slugApi = getSlugApi(slugDb);
  if (!slugApi) return null;

  const url = `${BASE_URL}/verses/${version}/${slugApi}/${capitulo}`;

  for (let attempt = 1; attempt <= tries; attempt++) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/json",
        "User-Agent": "biblia-api/1.0",
      },
    });

    if (res.status === 404) return [];

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (isRetryableStatus(res.status) && attempt < tries) {
        await sleep(800 * 2 ** (attempt - 1));
        continue;
      }
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
    }

    const data = (await res.json()) as ApiVersesResponse;
    return data.verses;
  }

  throw new Error(
    `Falha ao buscar versículos: ${slugDb} cap ${capitulo} (${version})`,
  );
}

/** Retorna um capítulo completo (versos + nº de versos) */
export async function buscarCapitulo(
  slugDb: string,
  capitulo: number,
  version: Version,
): Promise<{ chapter: number; verses: ApiVerse[] } | null> {
  const verses = await buscarVersiculos(slugDb, capitulo, version);
  if (verses === null) return null;
  return { chapter: capitulo, verses };
}

/**
 * Busca o livro inteiro (todos os capítulos) – cuidado: faz muitas requisições.
 * Use com parcimônia (e idealmente com delay externo).
 */
export async function buscarLivroCompleto(
  slugDb: string,
  version: Version,
  delayMs = 600,
): Promise<{ chapters: Array<{ number: number; verses: ApiVerse[] }> } | null> {
  const total = await buscarNumeroCapitulos(slugDb);
  if (!total) return null;

  const chapters: Array<{ number: number; verses: ApiVerse[] }> = [];

  for (let c = 1; c <= total; c++) {
    const verses = await buscarVersiculos(slugDb, c, version);
    if (verses === null) return null;

    chapters.push({ number: c, verses });
    await sleep(delayMs);
  }

  return { chapters };
}
