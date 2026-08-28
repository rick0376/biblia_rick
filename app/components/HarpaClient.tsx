//app/components/HarpaClient.tsx

"use client";

import Link from "next/link";
import {
  useMemo,
  useState,
} from "react";

type HarpaItem = {
  number: number;
  title: string;
  versesCount: number;
  verses: string[];
};

type ResultadoHino = {
  hino: HarpaItem;
  trecho: string | null;
  encontradoNaLetra: boolean;
  score: number;
};

function normalizeText(
  value: string,
) {
  return value
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .replace(/[“”"'’‘]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactText(
  value: string,
) {
  return value
    .replace(/\s+/g, " ")
    .trim();
}

function limitPreview(
  value: string,
  max = 125,
) {
  const text = compactText(value);

  if (text.length <= max) {
    return text;
  }

  return `${text.slice(0, max).trim()}…`;
}

function findMatchingVerse(
  verses: string[],
  query: string,
  terms: string[],
) {
  /*
   * Primeiro procura a expressão
   * completa exatamente na letra.
   */
  const exactVerse =
    verses.find((verse) =>
      normalizeText(verse).includes(
        query,
      ),
    );

  if (exactVerse) {
    return exactVerse;
  }

  /*
   * Se a frase não estiver inteira,
   * encontra a estrofe que contém
   * mais palavras pesquisadas.
   */
  let bestVerse: string | null = null;
  let bestScore = 0;

  for (const verse of verses) {
    const normalizedVerse =
      normalizeText(verse);

    const matches =
      terms.filter((term) =>
        normalizedVerse.includes(term),
      ).length;

    if (matches > bestScore) {
      bestScore = matches;
      bestVerse = verse;
    }
  }

  return bestScore > 0
    ? bestVerse
    : null;
}

function createExcerpt(
  value: string,
  query: string,
  terms: string[],
) {
  const text = compactText(value);
  const normalizedText =
    normalizeText(text);

  let index =
    normalizedText.indexOf(query);

  let matchedLength =
    query.length;

  /*
   * Caso a frase inteira não seja
   * encontrada, tenta localizar
   * uma das palavras digitadas.
   */
  if (index < 0) {
    for (const term of terms) {
      const termIndex =
        normalizedText.indexOf(term);

      if (termIndex >= 0) {
        index = termIndex;
        matchedLength =
          term.length;
        break;
      }
    }
  }

  if (index < 0) {
    return limitPreview(text);
  }

  const before = 45;
  const after = 85;

  const start =
    Math.max(0, index - before);

  const end =
    Math.min(
      text.length,
      index +
      matchedLength +
      after,
    );

  let excerpt =
    text.slice(start, end).trim();

  if (start > 0) {
    excerpt = `…${excerpt}`;
  }

  if (end < text.length) {
    excerpt = `${excerpt}…`;
  }

  return excerpt;
}

export default function HarpaClient({
  hinos,
  styles,
}: {
  hinos: HarpaItem[];
  styles: Record<string, string>;
}) {
  const [q, setQ] = useState("");

  const resultados =
    useMemo<ResultadoHino[]>(() => {
      const raw =
        q.trim();

      /*
       * Sem busca:
       * mostra todos os hinos
       * com uma pequena prévia
       * da primeira estrofe.
       */
      if (!raw) {
        return hinos.map((hino) => ({
          hino,

          trecho:
            hino.verses[0]
              ? limitPreview(
                hino.verses[0],
                105,
              )
              : null,

          encontradoNaLetra: false,
          score: 0,
        }));
      }

      /*
       * Busca direta por número.
       *
       * Aceita:
       * 15
       * Hino 15
       */
      const numberMatch =
        raw.match(
          /^(?:hino\s*)?(\d+)$/i,
        );

      if (numberMatch) {
        const number =
          Number(numberMatch[1]);

        return hinos
          .filter(
            (hino) =>
              hino.number === number,
          )
          .map((hino) => ({
            hino,

            trecho:
              hino.verses[0]
                ? limitPreview(
                  hino.verses[0],
                  125,
                )
                : null,

            encontradoNaLetra: false,
            score: 1000,
          }));
      }

      const search =
        normalizeText(raw);

      if (!search) {
        return [];
      }

      const terms =
        search
          .split(" ")
          .map((term) => term.trim())
          .filter(Boolean);

      const encontrados:
        ResultadoHino[] = [];

      for (const hino of hinos) {
        const normalizedTitle =
          normalizeText(hino.title);

        const normalizedLyrics =
          hino.verses
            .map((verse) =>
              normalizeText(verse),
            )
            .join(" ");

        const exactTitle =
          normalizedTitle === search;

        const titleStarts =
          normalizedTitle.startsWith(
            search,
          );

        const titleContains =
          normalizedTitle.includes(
            search,
          );

        const phraseInLyrics =
          normalizedLyrics.includes(
            search,
          );

        const allTermsInTitle =
          terms.length > 0 &&
          terms.every((term) =>
            normalizedTitle.includes(
              term,
            ),
          );

        const allTermsInLyrics =
          terms.length > 0 &&
          terms.every((term) =>
            normalizedLyrics.includes(
              term,
            ),
          );

        const matches =
          exactTitle ||
          titleStarts ||
          titleContains ||
          phraseInLyrics ||
          allTermsInTitle ||
          allTermsInLyrics;

        if (!matches) {
          continue;
        }

        /*
         * Dá prioridade aos resultados
         * mais prováveis.
         */
        let score = 0;

        if (exactTitle) {
          score += 500;
        } else if (titleStarts) {
          score += 400;
        } else if (titleContains) {
          score += 300;
        }

        if (phraseInLyrics) {
          score += 250;
        }

        if (allTermsInTitle) {
          score += 180;
        }

        if (allTermsInLyrics) {
          score += 120;
        }

        const matchingVerse =
          phraseInLyrics ||
            allTermsInLyrics
            ? findMatchingVerse(
              hino.verses,
              search,
              terms,
            )
            : null;

        const encontradoNaLetra =
          Boolean(matchingVerse);

        let trecho: string | null =
          null;

        if (matchingVerse) {
          trecho = createExcerpt(
            matchingVerse,
            search,
            terms,
          );
        } else if (hino.verses[0]) {
          trecho = limitPreview(
            hino.verses[0],
            105,
          );
        }

        encontrados.push({
          hino,
          trecho,
          encontradoNaLetra,
          score,
        });
      }

      return encontrados.sort(
        (a, b) => {
          if (b.score !== a.score) {
            return b.score - a.score;
          }

          return (
            a.hino.number -
            b.hino.number
          );
        },
      );
    }, [q, hinos]);

  return (
    <>
      <input
        className={styles.search}
        placeholder="Buscar por número, título ou trecho da letra..."
        value={q}
        onChange={(e) =>
          setQ(e.target.value)
        }
        aria-label="Buscar hino da Harpa Cristã"
      />

      <div className={styles.grid}>
        {resultados.map(
          ({
            hino,
            trecho,
            encontradoNaLetra,
          }) => (
            <Link
              key={hino.number}
              href={`/harpa/${hino.number}`}
              className={styles.card}
            >
              <div
                className={
                  styles.cardTitle
                }
              >
                {hino.number}.{" "}
                {hino.title}
              </div>

              <div
                className={
                  styles.count
                }
              >
                {hino.versesCount}{" "}
                {hino.versesCount === 1
                  ? "estrofe"
                  : "estrofes"}
              </div>

              {trecho && (
                <div
                  className={
                    styles.count
                  }
                >
                  {q.trim() &&
                    encontradoNaLetra
                    ? "Trecho encontrado: "
                    : "Trecho: "}
                  “{trecho}”
                </div>
              )}
            </Link>
          ),
        )}
      </div>

      {resultados.length === 0 && (
        <p className={styles.empty}>
          Nenhum hino encontrado para
          {" "}
          <strong>
            “{q.trim()}”
          </strong>
          .
        </p>
      )}
    </>
  );
}