const BASE_URL = "https://api.gobible.app/v1";

export type ApiVerse = {
  number: number;
  text: string;
};

type GoBibleEnvelope = {
  data?: unknown;
};

type GoBibleBookLike = {
  chapters?: unknown;
  chapterCount?: unknown;
};

type GoBibleVerseLike =
  | {
      number?: unknown;
      verse?: unknown;
      text?: unknown;
      content?: unknown;
      value?: unknown;
    }
  | string;

const KJA_BOOK_SLUG_OVERRIDES: Record<string, string> = {
  cantares: "canticos",
};

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

function isRetryableStatus(status: number): boolean {
  return [429, 500, 502, 503, 504].includes(status);
}

function getKjaBookSlug(slugDb: string): string {
  return KJA_BOOK_SLUG_OVERRIDES[slugDb.toLowerCase()] ?? slugDb.toLowerCase();
}

async function fetchJsonWithRetry(url: string, tries = 5): Promise<unknown> {
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "biblia-kja/1.0",
        },
      });

      if (res.status === 404) {
        throw new Error(`404 GoBible: ${url}`);
      }

      if (!res.ok) {
        const text = await res.text().catch(() => "");

        if (isRetryableStatus(res.status) && attempt < tries) {
          await sleep(800 * 2 ** (attempt - 1));
          continue;
        }

        throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
      }

      return (await res.json()) as unknown;
    } catch (error) {
      if (attempt === tries) throw error;
      await sleep(800 * 2 ** (attempt - 1));
    }
  }

  throw new Error("fetchJsonWithRetry falhou");
}

function unwrapData(payload: unknown): unknown {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as GoBibleEnvelope).data;
  }

  return payload;
}

function readChapterCount(payload: unknown): number {
  const data = unwrapData(payload) as GoBibleBookLike;
  const raw = data?.chapters ?? data?.chapterCount;
  const total = Number(raw);

  if (!Number.isFinite(total) || total <= 0) {
    throw new Error(
      "Não foi possível ler a quantidade de capítulos da GoBible.",
    );
  }

  return total;
}

function pickVerseArray(payload: unknown): GoBibleVerseLike[] | null {
  const data = unwrapData(payload);

  if (Array.isArray(data)) {
    return data as GoBibleVerseLike[];
  }

  if (!data || typeof data !== "object") {
    return null;
  }

  const obj = data as Record<string, unknown>;

  if (Array.isArray(obj.verses)) return obj.verses as GoBibleVerseLike[];
  if (Array.isArray(obj.content)) return obj.content as GoBibleVerseLike[];
  if (Array.isArray(obj.items)) return obj.items as GoBibleVerseLike[];

  if (obj.chapter && typeof obj.chapter === "object") {
    const chapter = obj.chapter as Record<string, unknown>;
    if (Array.isArray(chapter.verses))
      return chapter.verses as GoBibleVerseLike[];
    if (Array.isArray(chapter.content))
      return chapter.content as GoBibleVerseLike[];
    if (Array.isArray(chapter.items))
      return chapter.items as GoBibleVerseLike[];
  }

  return null;
}

function getVerseNumber(item: GoBibleVerseLike, index: number): number {
  if (typeof item === "string") return index + 1;

  const raw = item.number ?? item.verse ?? index + 1;
  const parsed = Number(raw);

  return Number.isFinite(parsed) ? parsed : index + 1;
}

function getVerseText(item: GoBibleVerseLike): string {
  if (typeof item === "string") return item.trim();

  const raw = item.text ?? item.content ?? item.value ?? "";
  return String(raw).trim();
}

function normalizeVerses(payload: unknown): ApiVerse[] {
  const rawVerses = pickVerseArray(payload);

  if (!rawVerses) {
    throw new Error("Formato inesperado da resposta da GoBible.");
  }

  return rawVerses
    .map((item, index) => ({
      number: getVerseNumber(item, index),
      text: getVerseText(item),
    }))
    .filter((verse) => verse.text.length > 0);
}

export async function buscarNumeroCapitulosKja(
  slugDb: string,
): Promise<number> {
  const bookSlug = getKjaBookSlug(slugDb);
  const json = await fetchJsonWithRetry(`${BASE_URL}/books/${bookSlug}`);
  return readChapterCount(json);
}

export async function buscarVersiculosKja(
  slugDb: string,
  capitulo: number,
): Promise<ApiVerse[]> {
  const bookSlug = getKjaBookSlug(slugDb);
  const json = await fetchJsonWithRetry(
    `${BASE_URL}/kja/${bookSlug}/${capitulo}`,
  );

  return normalizeVerses(json);
}

export async function buscarCapituloKja(
  slugDb: string,
  capitulo: number,
): Promise<{ chapter: number; verses: ApiVerse[] }> {
  const verses = await buscarVersiculosKja(slugDb, capitulo);

  return {
    chapter: capitulo,
    verses,
  };
}
