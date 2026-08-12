// app/components/PergunteBiblia.tsx

"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import styles from "./PergunteBiblia.module.scss";

type Version =
  | "acf"
  | "ara"
  | "nvi"
  | "kja";

type Reference = {
  id: string | number;
  number: number;
  text: string;
  reference: string;
  book: string;
  slug: string;
  chapter: number;
};

type CitedReference = {
  reference: string;
  matchedText: string;
  book: string;
  slug: string;
  chapter: number;
  verseStart: number;
  verseEnd: number | null;
};

type ApiResult = {
  ok: boolean;
  answer?: string;
  references?: Reference[];
  citedReferences?: CitedReference[];
  error?: string;
};

type PergunteBibliaProps = {
  version: Version;
  canUseAi: boolean;
};

type SavedSearch = {
  question: string;
  answer: string | null;
  references: Reference[];
  citedReferences: CitedReference[];
};

const DEFAULT_SUGGESTIONS = [
  "Ansiedade",
  "Fé",
  "Amor",
  "Perdão",
  "Salvação",
  "Esperança",
];

const SUGGESTIONS_STORAGE_KEY =
  "pergunte_biblia_suggestions";

function getSearchStorageKey(
  version: Version,
) {
  return `pergunte_biblia_result_${version}`;
}

function escapeRegExp(
  value: string,
) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
}

export default function PergunteBiblia({
  version,
  canUseAi,
}: PergunteBibliaProps) {
  const [
    question,
    setQuestion,
  ] = useState("");

  const [
    answer,
    setAnswer,
  ] = useState<string | null>(
    null,
  );

  const [
    references,
    setReferences,
  ] = useState<Reference[]>(
    [],
  );

  const [
    citedReferences,
    setCitedReferences,
  ] = useState<
    CitedReference[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    suggestions,
    setSuggestions,
  ] = useState<string[]>(
    DEFAULT_SUGGESTIONS,
  );

  const [
    searchLoaded,
    setSearchLoaded,
  ] = useState(false);

  /* =======================================================
     SALVA PESQUISA
  ======================================================= */

  function saveSearch(
    data: SavedSearch,
  ) {
    try {
      localStorage.setItem(
        getSearchStorageKey(
          version,
        ),
        JSON.stringify(data),
      );
    } catch {
      // ignora erro
    }
  }

  /* =======================================================
     SALVA O ESTADO ATUAL IMEDIATAMENTE
  ======================================================= */

  function persistCurrentSearch() {
    saveSearch({
      question,
      answer,
      references,
      citedReferences,
    });
  }

  /* =======================================================
     CARREGA SUGESTÕES
  ======================================================= */

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          SUGGESTIONS_STORAGE_KEY,
        );

      if (!saved) {
        return;
      }

      const parsed =
        JSON.parse(saved);

      if (
        Array.isArray(
          parsed,
        ) &&
        parsed.every(
          (item) =>
            typeof item ===
            "string",
        )
      ) {
        setSuggestions(
          parsed,
        );
      }
    } catch {
      // ignora erro
    }
  }, []);

  /* =======================================================
     SALVA SUGESTÕES
  ======================================================= */

  useEffect(() => {
    try {
      localStorage.setItem(
        SUGGESTIONS_STORAGE_KEY,
        JSON.stringify(
          suggestions,
        ),
      );
    } catch {
      // ignora erro
    }
  }, [suggestions]);

  /* =======================================================
     CARREGA ÚLTIMA PERGUNTA E RESPOSTA
  ======================================================= */

  useEffect(() => {
    setSearchLoaded(false);

    try {
      const saved =
        localStorage.getItem(
          getSearchStorageKey(
            version,
          ),
        );

      if (!saved) {
        setQuestion("");
        setAnswer(null);
        setReferences([]);
        setCitedReferences([]);
        setError(null);
        setSearchLoaded(true);

        return;
      }

      const parsed =
        JSON.parse(
          saved,
        ) as SavedSearch;

      setQuestion(
        typeof parsed.question ===
          "string"
          ? parsed.question
          : "",
      );

      setAnswer(
        typeof parsed.answer ===
          "string"
          ? parsed.answer
          : null,
      );

      setReferences(
        Array.isArray(
          parsed.references,
        )
          ? parsed.references
          : [],
      );

      setCitedReferences(
        Array.isArray(
          parsed.citedReferences,
        )
          ? parsed.citedReferences
          : [],
      );

      setError(null);
    } catch {
      setQuestion("");
      setAnswer(null);
      setReferences([]);
      setCitedReferences([]);
      setError(null);
    } finally {
      setSearchLoaded(true);
    }
  }, [version]);

  /* =======================================================
     MANTÉM ESTADO SALVO
  ======================================================= */

  useEffect(() => {
    if (!searchLoaded) {
      return;
    }

    saveSearch({
      question,
      answer,
      references,
      citedReferences,
    });
  }, [
    question,
    answer,
    references,
    citedReferences,
    version,
    searchLoaded,
  ]);

  /* =======================================================
     LIMPAR SOMENTE RESPOSTA
  ======================================================= */

  function clearResult() {
    setAnswer(null);
    setReferences([]);
    setCitedReferences([]);
    setError(null);

    saveSearch({
      question,
      answer: null,
      references: [],
      citedReferences: [],
    });
  }

  /* =======================================================
     LIMPAR TUDO
  ======================================================= */

  function clearAll() {
    setQuestion("");
    setAnswer(null);
    setReferences([]);
    setCitedReferences([]);
    setError(null);

    try {
      localStorage.removeItem(
        getSearchStorageKey(
          version,
        ),
      );
    } catch {
      // ignora erro
    }
  }

  /* =======================================================
     SUGESTÕES
  ======================================================= */

  function removeSuggestion(
    item: string,
  ) {
    setSuggestions(
      (current) =>
        current.filter(
          (suggestion) =>
            suggestion !==
            item,
        ),
    );
  }

  function restoreSuggestions() {
    setSuggestions(
      DEFAULT_SUGGESTIONS,
    );
  }

  function fillSuggestion(
    item: string,
  ) {
    const newQuestion =
      `O que a Bíblia ensina sobre ${item.toLowerCase()}?`;

    setQuestion(
      newQuestion,
    );

    setAnswer(null);
    setReferences([]);
    setCitedReferences([]);
    setError(null);

    saveSearch({
      question:
        newQuestion,
      answer: null,
      references: [],
      citedReferences: [],
    });
  }

  /* =======================================================
     ENVIA PERGUNTA
  ======================================================= */

  async function submit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!canUseAi) {
      return;
    }

    const trimmed =
      question.trim();

    if (
      trimmed.length < 3 ||
      loading
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response =
        await fetch(
          "/api/biblia/ia",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                question:
                  trimmed,
                version,
              }),
          },
        );

      const data =
        (await response.json()) as ApiResult;

      if (
        !response.ok ||
        !data.ok
      ) {
        setError(
          data.error ||
            "Não foi possível responder agora.",
        );

        return;
      }

      const newAnswer =
        data.answer ||
        null;

      const newReferences =
        data.references ||
        [];

      const newCitedReferences =
        data.citedReferences ||
        [];

      /* ===================================================
         SALVA IMEDIATAMENTE A RESPOSTA DA GEMINI
      =================================================== */

      saveSearch({
        question:
          trimmed,

        answer:
          newAnswer,

        references:
          newReferences,

        citedReferences:
          newCitedReferences,
      });

      /* ===================================================
         ATUALIZA A TELA
      =================================================== */

      setQuestion(
        trimmed,
      );

      setAnswer(
        newAnswer,
      );

      setReferences(
        newReferences,
      );

      setCitedReferences(
        newCitedReferences,
      );
    } catch {
      setError(
        "Não foi possível conectar à Inteligência Bíblica.",
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     REFERÊNCIAS CLICÁVEIS DENTRO DA RESPOSTA
  ======================================================= */

  function renderAnswer() {
    if (!answer) {
      return null;
    }

    if (
      citedReferences.length ===
      0
    ) {
      return answer;
    }

    const matchedTexts =
      citedReferences
        .map(
          (citation) =>
            citation.matchedText,
        )
        .filter(Boolean)
        .sort(
          (a, b) =>
            b.length -
            a.length,
        );

    if (
      matchedTexts.length ===
      0
    ) {
      return answer;
    }

    const pattern =
      matchedTexts
        .map(
          (text) =>
            escapeRegExp(
              text,
            ),
        )
        .join("|");

    const regex =
      new RegExp(
        `(${pattern})`,
        "g",
      );

    return answer
      .split(regex)
      .map(
        (
          part,
          index,
        ) => {
          const citation =
            citedReferences.find(
              (item) =>
                item.matchedText ===
                part,
            );

          if (!citation) {
            return part;
          }

          return (
            <Link
              key={`${citation.slug}-${citation.chapter}-${citation.verseStart}-${index}`}
              href={`/livros/${citation.slug}/${citation.chapter}?v=${version}#v-${citation.verseStart}`}
              className={
                styles.inlineBibleLink
              }
              title={`Abrir ${citation.reference}`}
              onClick={
                persistCurrentSearch
              }
            >
              {part}
            </Link>
          );
        },
      );
  }

  const showRestoreButton =
    suggestions.length <
    DEFAULT_SUGGESTIONS.length;

  /* =======================================================
     TELA
  ======================================================= */

  return (
    <section
      className={
        styles.container
      }
    >
      <div
        className={
          styles.aiHeader
        }
      >
        <div
          className={
            styles.aiIcon
          }
        >
          ✦
        </div>

        <div
          className={
            styles.aiTitle
          }
        >
          <span
            className={
              styles.badge
            }
          >
            Pesquisa inteligente
          </span>

          <h2>
            Pergunte à Bíblia
          </h2>

          <p>
            Faça uma pergunta e
            encontre uma resposta
            acompanhada dos
            versículos relacionados
            na versão{" "}
            {version.toUpperCase()}.
          </p>
        </div>

        <div
          className={
            styles.versionBadge
          }
        >
          📖{" "}
          {version.toUpperCase()}
        </div>
      </div>

      {!canUseAi && (
        <div
          className={
            styles.error
          }
        >
          🔒 A Inteligência
          Bíblica não está liberada
          para este usuário.
        </div>
      )}

      <form
        onSubmit={submit}
        className={
          styles.form
        }
      >
        <textarea
          className={
            styles.input
          }
          value={question}
          onChange={(
            event,
          ) =>
            setQuestion(
              event.target.value,
            )
          }
          placeholder={
            canUseAi
              ? "Ex.: O que a Bíblia ensina sobre ansiedade e confiança em Deus?"
              : "Recurso não liberado para este usuário."
          }
          maxLength={500}
          rows={3}
          disabled={
            loading ||
            !canUseAi
          }
          aria-label="Pergunte à Bíblia"
        />

        <div
          className={
            styles.formFooter
          }
        >
          <span
            className={
              styles.hint
            }
          >
            {question.length}
            /500
          </span>

          <div
            className={
              styles.formActions
            }
          >
            {(question ||
              answer ||
              error ||
              references.length >
                0 ||
              citedReferences.length >
                0) && (
              <button
                type="button"
                className={
                  styles.secondaryButton
                }
                onClick={
                  clearAll
                }
                disabled={
                  loading
                }
              >
                Limpar
              </button>
            )}

            <button
              type="submit"
              className={
                styles.button
              }
              disabled={
                !canUseAi ||
                loading ||
                question
                  .trim()
                  .length < 3
              }
            >
              {!canUseAi
                ? "Acesso bloqueado"
                : loading
                  ? "Pesquisando..."
                  : "Perguntar →"}
            </button>
          </div>
        </div>
      </form>

      <div
        className={
          styles.suggestions
        }
        aria-label="Sugestões de pesquisa"
      >
        {suggestions.map(
          (item) => (
            <div
              key={item}
              className={
                styles.suggestionItem
              }
            >
              <button
                type="button"
                className={
                  styles.suggestionButton
                }
                onClick={() =>
                  fillSuggestion(
                    item,
                  )
                }
                disabled={
                  loading ||
                  !canUseAi
                }
              >
                {item}
              </button>

              <button
                type="button"
                className={
                  styles.removeSuggestionButton
                }
                onClick={() =>
                  removeSuggestion(
                    item,
                  )
                }
                disabled={
                  loading
                }
                aria-label={`Excluir sugestão ${item}`}
              >
                ×
              </button>
            </div>
          ),
        )}

        {showRestoreButton && (
          <button
            type="button"
            className={
              styles.restoreButton
            }
            onClick={
              restoreSuggestions
            }
            disabled={
              loading
            }
          >
            Restaurar sugestões
          </button>
        )}
      </div>

      {error && (
        <div
          className={
            styles.error
          }
        >
          ⚠️ {error}
        </div>
      )}

      {answer && (
        <div
          className={
            styles.result
          }
        >
          <div
            className={
              styles.answerHeader
            }
          >
            <span>
              📜 Resposta
            </span>

            <div
              className={
                styles.answerHeaderRight
              }
            >
              <button
                type="button"
                className={
                  styles.clearResultButton
                }
                onClick={
                  clearResult
                }
              >
                Limpar resposta
              </button>

              <span
                className={
                  styles.answerVersion
                }
              >
                {version.toUpperCase()}
              </span>
            </div>
          </div>

          <div
            className={
              styles.answer
            }
          >
            {renderAnswer()}
          </div>

          {citedReferences.length >
            0 && (
            <div
              className={
                styles.citedReferences
              }
            >
              <div
                className={
                  styles.citedReferencesHeader
                }
              >
                <h3>
                  📖 Referências
                  citadas
                </h3>

                <span>
                  {
                    citedReferences.length
                  }
                </span>
              </div>

              <div
                className={
                  styles.citedReferenceList
                }
              >
                {citedReferences.map(
                  (
                    citation,
                  ) => (
                    <Link
                      key={`${citation.slug}-${citation.chapter}-${citation.verseStart}-${citation.verseEnd ?? ""}`}
                      href={`/livros/${citation.slug}/${citation.chapter}?v=${version}#v-${citation.verseStart}`}
                      className={
                        styles.citedReferenceLink
                      }
                      title={`Abrir ${citation.reference}`}
                      onClick={
                        persistCurrentSearch
                      }
                    >
                      📖{" "}
                      {
                        citation.reference
                      }{" "}
                      →
                    </Link>
                  ),
                )}
              </div>
            </div>
          )}

          {references.length >
            0 && (
            <div
              className={
                styles.references
              }
            >
              <h3>
                Versículos
                encontrados
              </h3>

              <div
                className={
                  styles.referenceList
                }
              >
                {references.map(
                  (
                    reference,
                  ) => (
                    <article
                      key={
                        reference.id
                      }
                      className={
                        styles.reference
                      }
                    >
                      <div
                        className={
                          styles.referenceTop
                        }
                      >
                        <strong>
                          {
                            reference.reference
                          }
                        </strong>

                        <Link
                          href={`/livros/${reference.slug}/${reference.chapter}?v=${version}#v-${reference.number}`}
                          className={
                            styles.readLink
                          }
                          onClick={
                            persistCurrentSearch
                          }
                        >
                          Ler no
                          contexto →
                        </Link>
                      </div>

                      <p>
                        {
                          reference.text
                        }
                      </p>
                    </article>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
