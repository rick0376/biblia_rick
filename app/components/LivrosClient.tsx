//app/components/LivrosClient.tsx

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import styles from "../livros/styles.module.scss";

type Version = "acf" | "ara" | "nvi" | "kja";

type Livro = {
  id: number;
  name: string;
  slug: string;
  testament: string;
  chaptersCount: number;
  hasNotes: boolean;
};

type BuscaBiblica = {
  livro: Livro | null;
  chapter: number | null;
  verse: number | null;
};

function normalizarTestamento(t: string) {
  const s = (t || "").toLowerCase();

  if (s.includes("novo")) {
    return "Novo";
  }

  return "Antigo";
}

/* =========================================================
   NORMALIZA TEXTO
   João -> joao
   1-João -> 1 joao
========================================================= */

function normalizarTexto(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================================================
   INTERPRETA BUSCA BÍBLICA

   Exemplos:
   genesis
   genesis 10
   genesis 10 20
   genesis 10:20
   joao 3:16
   1 joao 2 5
========================================================= */

function interpretarBusca(
  query: string,
  livros: Livro[],
): BuscaBiblica {
  const busca = normalizarTexto(query);

  if (!busca) {
    return {
      livro: null,
      chapter: null,
      verse: null,
    };
  }

  /*
   * Ordenamos pelos nomes maiores primeiro.
   * Isso ajuda em livros como:
   * 1 Samuel
   * 2 Samuel
   * 1 João
   * 2 João
   */
  const candidatos = [...livros].sort(
    (a, b) =>
      normalizarTexto(b.name).length -
      normalizarTexto(a.name).length,
  );

  for (const livro of candidatos) {
    const nomes = [
      normalizarTexto(livro.name),
      normalizarTexto(livro.slug),
    ];

    for (const nomeLivro of nomes) {
      const livroExato =
        busca === nomeLivro;

      const livroComReferencia =
        busca.startsWith(
          `${nomeLivro} `,
        );

      if (
        !livroExato &&
        !livroComReferencia
      ) {
        continue;
      }

      if (livroExato) {
        return {
          livro,
          chapter: null,
          verse: null,
        };
      }

      const restante = busca
        .slice(nomeLivro.length)
        .trim();

      /*
       * Aceita:
       *
       * 10
       * 10 20
       * 10:20
       * 10.20
       * 10,20
       */
      const referencia =
        restante.match(
          /^(\d+)(?:\s*[:.,]\s*|\s+)?(\d+)?$/,
        );

      if (!referencia) {
        return {
          livro,
          chapter: null,
          verse: null,
        };
      }

      const chapter =
        Number(referencia[1]);

      const verse =
        referencia[2]
          ? Number(referencia[2])
          : null;

      return {
        livro,
        chapter:
          Number.isFinite(chapter) &&
            chapter > 0
            ? chapter
            : null,

        verse:
          verse !== null &&
            Number.isFinite(verse) &&
            verse > 0
            ? verse
            : null,
      };
    }
  }

  return {
    livro: null,
    chapter: null,
    verse: null,
  };
}

export default function LivrosClient({
  livros,
  version,
}: {
  livros?: Livro[];
  version: Version;
}) {
  const router = useRouter();

  const [q, setQ] = useState("");

  const livrosSafe = useMemo<Livro[]>(
    () =>
      Array.isArray(livros)
        ? livros
        : [],
    [livros],
  );

  const buscaInterpretada =
    useMemo(
      () =>
        interpretarBusca(
          q,
          livrosSafe,
        ),
      [q, livrosSafe],
    );

  /* =========================================================
     FILTRO VISUAL
  ========================================================= */

  const filtrados = useMemo(() => {
    const busca =
      normalizarTexto(q);

    if (!busca) {
      return livrosSafe;
    }

    /*
     * Se reconheceu:
     *
     * genesis 10
     * genesis 10 20
     *
     * mostramos Gênesis na lista.
     */
    if (buscaInterpretada.livro) {
      return [
        buscaInterpretada.livro,
      ];
    }

    /*
     * Busca normal por nome
     */
    return livrosSafe.filter(
      (livro) => {
        const nome =
          normalizarTexto(
            livro.name,
          );

        const slug =
          normalizarTexto(
            livro.slug,
          );

        return (
          nome.includes(busca) ||
          slug.includes(busca)
        );
      },
    );
  }, [
    q,
    livrosSafe,
    buscaInterpretada,
  ]);

  const antigo = useMemo(
    () =>
      filtrados.filter(
        (livro) =>
          normalizarTestamento(
            livro.testament,
          ) === "Antigo",
      ),
    [filtrados],
  );

  const novo = useMemo(
    () =>
      filtrados.filter(
        (livro) =>
          normalizarTestamento(
            livro.testament,
          ) === "Novo",
      ),
    [filtrados],
  );

  /* =========================================================
     ENTER NA BUSCA
  ========================================================= */

  function abrirBusca() {
    const {
      livro,
      chapter,
      verse,
    } = buscaInterpretada;

    if (!livro) {
      return;
    }

    /*
     * Exemplo:
     * genesis
     *
     * Abre o livro.
     */
    if (!chapter) {
      router.push(
        `/livros/${livro.slug}?v=${version}`,
      );

      return;
    }

    /*
     * Evita abrir capítulo inexistente.
     */
    if (
      chapter >
      livro.chaptersCount
    ) {
      return;
    }

    /*
     * Exemplo:
     * genesis 10
     *
     * Abre capítulo 10 normalmente,
     * começando no versículo 1.
     */
    if (!verse) {
      router.push(
        `/livros/${livro.slug}/${chapter}?v=${version}`,
      );

      return;
    }

    /*
     * Exemplo:
     * genesis 10 20
     * genesis 10:20
     *
     * Abre diretamente o versículo 20.
     */
    router.push(
      `/livros/${livro.slug}/${chapter}?v=${version}#v-${verse}`,
    );
  }

  return (
    <>
      <input
        className={styles.search}
        placeholder="Buscar livro ou referência (ex: João 3:16)"
        value={q}
        onChange={(e) =>
          setQ(e.target.value)
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            abrirBusca();
          }
        }}
        aria-label="Buscar livro, capítulo ou versículo"
      />

      <section
        className={styles.section}
      >
        <div
          className={
            styles.sectionHeader
          }
        >
          <h2
            className={
              styles.sectionTitle
            }
          >
            Antigo Testamento
          </h2>

          <span
            className={
              styles.sectionBadge
            }
          >
            {antigo.length}
          </span>
        </div>

        <div
          className={
            styles.sectionDivider
          }
        >
          <div
            className={
              styles.grid
            }
          >
            {antigo.map(
              (livro) => (
                <Link
                  key={livro.id}
                  href={`/livros/${livro.slug}?v=${version}`}
                  className={
                    styles.card
                  }
                >
                  <div
                    className={
                      styles.cardTitle
                    }
                    style={{
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      gap: 8,
                    }}
                  >
                    <span>
                      {livro.name}
                    </span>

                    {livro.hasNotes && (
                      <span
                        title="Este livro tem anotações"
                      >
                        📝
                      </span>
                    )}
                  </div>

                  <div
                    className={
                      styles.count
                    }
                  >
                    {
                      livro.chaptersCount
                    }{" "}
                    capítulos
                  </div>
                </Link>
              ),
            )}
          </div>
        </div>
      </section>

      <section
        className={styles.section}
      >
        <div
          className={
            styles.sectionHeader
          }
        >
          <h2
            className={
              styles.sectionTitle
            }
          >
            Novo Testamento
          </h2>

          <span
            className={
              styles.sectionBadge
            }
          >
            {novo.length}
          </span>
        </div>

        <div
          className={
            styles.sectionDivider
          }
        >
          <div
            className={
              styles.grid
            }
          >
            {novo.map(
              (livro) => (
                <Link
                  key={livro.id}
                  href={`/livros/${livro.slug}?v=${version}`}
                  className={
                    styles.card
                  }
                >
                  <div
                    className={
                      styles.cardTitle
                    }
                    style={{
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      gap: 8,
                    }}
                  >
                    <span>
                      {livro.name}
                    </span>

                    {livro.hasNotes && (
                      <span
                        title="Este livro tem anotações"
                      >
                        📝
                      </span>
                    )}
                  </div>

                  <div
                    className={
                      styles.count
                    }
                  >
                    {
                      livro.chaptersCount
                    }{" "}
                    capítulos
                  </div>
                </Link>
              ),
            )}
          </div>
        </div>
      </section>

      {filtrados.length ===
        0 && (
          <p
            className={styles.empty}
          >
            Nenhum livro encontrado.
          </p>
        )}
    </>
  );
}