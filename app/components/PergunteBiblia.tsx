//app/components/PergunteBiblia.tsx

"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import styles from "./PergunteBiblia.module.scss";

type Version = "acf" | "ara" | "nvi" | "kja";

type Reference = {
  id: number;
  number: number;
  text: string;
  reference: string;
  book: string;
  slug: string;
  chapter: number;
};

type ApiResult = {
  ok: boolean;
  answer?: string;
  references?: Reference[];
  error?: string;
};

type PergunteBibliaProps = {
  version: Version;
  canUseAi: boolean;
};

export default function PergunteBiblia({
  version,
  canUseAi,
}: PergunteBibliaProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [references, setReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canUseAi) return;

    const trimmed = question.trim();

    if (trimmed.length < 3 || loading) return;

    setLoading(true);
    setError(null);
    setAnswer(null);
    setReferences([]);

    try {
      const response = await fetch("/api/biblia/ia", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          question: trimmed,
          version,
        }),
      });

      const data = (await response.json()) as ApiResult;

      if (!response.ok || !data.ok) {
        setError(
          data.error ||
          "Não foi possível responder agora.",
        );

        return;
      }

      setAnswer(data.answer || null);
      setReferences(data.references || []);
    } catch {
      setError(
        "Não foi possível conectar à inteligência bíblica.",
      );
    } finally {
      setLoading(false);
    }
  }

  const suggestions = [
    "Ansiedade",
    "Fé",
    "Amor",
    "Perdão",
    "Salvação",
    "Esperança",
  ];

  return (
    <section className={styles.container}>
      <div className={styles.aiHeader}>
        <div className={styles.aiIcon}>
          ✦
        </div>

        <div className={styles.aiTitle}>
          <span className={styles.badge}>
            Pesquisa inteligente
          </span>

          <h2>Pergunte à Bíblia</h2>

          <p>
            Faça uma pergunta e encontre uma resposta acompanhada dos
            versículos relacionados na versão {version.toUpperCase()}.
          </p>
        </div>

        <div className={styles.versionBadge}>
          📖 {version.toUpperCase()}
        </div>
      </div>

      {!canUseAi && (
        <div className={styles.error}>
          🔒 A Inteligência Bíblica não está liberada para este usuário.
        </div>
      )}

      <form onSubmit={submit} className={styles.form}>
        <textarea
          className={styles.input}
          value={question}
          onChange={(event) =>
            setQuestion(event.target.value)
          }
          placeholder={
            canUseAi
              ? "Ex.: O que a Bíblia ensina sobre ansiedade e confiança em Deus?"
              : "Recurso não liberado para este usuário."
          }
          maxLength={500}
          rows={3}
          disabled={loading || !canUseAi}
          aria-label="Pergunte à Bíblia"
        />

        <div className={styles.formFooter}>
          <span className={styles.hint}>
            {question.length}/500
          </span>

          <button
            type="submit"
            className={styles.button}
            disabled={
              !canUseAi ||
              loading ||
              question.trim().length < 3
            }
          >
            {!canUseAi
              ? "Acesso bloqueado"
              : loading
                ? "Pesquisando..."
                : "Perguntar →"}
          </button>
        </div>
      </form>

      <div
        className={styles.suggestions}
        aria-label="Sugestões de pesquisa"
      >
        {suggestions.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() =>
              setQuestion(
                `O que a Bíblia ensina sobre ${item.toLowerCase()}?`,
              )
            }
            disabled={loading || !canUseAi}
          >
            {item}
          </button>
        ))}
      </div>

      {error && (
        <div className={styles.error}>
          ⚠️ {error}
        </div>
      )}

      {answer && (
        <div className={styles.result}>
          <div className={styles.answerHeader}>
            <span>📜 Resposta</span>

            <span className={styles.answerVersion}>
              {version.toUpperCase()}
            </span>
          </div>

          <div className={styles.answer}>
            {answer}
          </div>

          {references.length > 0 && (
            <div className={styles.references}>
              <h3>Versículos encontrados</h3>

              <div className={styles.referenceList}>
                {references.map((reference) => (
                  <article
                    key={reference.id}
                    className={styles.reference}
                  >
                    <div className={styles.referenceTop}>
                      <strong>
                        {reference.reference}
                      </strong>

                      <Link
                        href={`/livros/${reference.slug}/${reference.chapter}?v=${version}#v-${reference.number}`}
                        className={styles.readLink}
                      >
                        Ler no contexto →
                      </Link>
                    </div>

                    <p>{reference.text}</p>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}