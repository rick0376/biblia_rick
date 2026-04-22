//app/components/CapituloClient.tsx

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import styles from "../livros/[slug]/[capitulo]/styles.module.scss";

type Versiculo = {
  id: number;
  number: number;
  text: string;
  isFavorite: boolean;
  noteContent: string | null;
};

type Version = "acf" | "ara" | "nvi" | "kja";

export default function CapituloClient({
  versiculos,
  livro,
  capitulo,
  slug,
  version,
}: {
  versiculos: Versiculo[];
  livro: string;
  capitulo: number;
  slug: string;
  version: Version;
}) {
  const [q, setQ] = useState("");
  const [ativo, setAtivo] = useState<number>(
    () => versiculos?.[0]?.number ?? 1,
  );
  const [favoritos, setFavoritos] = useState<Record<number, boolean>>(
    Object.fromEntries(versiculos.map((v) => [v.id, v.isFavorite])),
  );
  const [anotacoes, setAnotacoes] = useState<Record<number, string>>(
    Object.fromEntries(
      versiculos
        .filter((v) => v.noteContent)
        .map((v) => [v.id, v.noteContent as string]),
    ),
  );
  const [carregandoFavorito, setCarregandoFavorito] = useState<
    Record<number, boolean>
  >({});
  const [modalAberta, setModalAberta] = useState(false);
  const [versiculoAtualId, setVersiculoAtualId] = useState<number | null>(null);
  const [textoAnotacao, setTextoAnotacao] = useState("");
  const [salvandoAnotacao, setSalvandoAnotacao] = useState(false);

  const filtrados = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return versiculos;

    const num = Number(s.replace(/[^\d]/g, ""));
    if (Number.isFinite(num) && num > 0) {
      return versiculos.filter((v) => v.number === num);
    }
    return versiculos.filter((v) => v.text.toLowerCase().includes(s));
  }, [q, versiculos]);

  const versiculoAtual = useMemo(
    () => versiculos.find((v) => v.id === versiculoAtualId) ?? null,
    [versiculoAtualId, versiculos],
  );

  useEffect(() => {
    const el = document.getElementById(`v-${ativo}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [ativo]);

  async function toggleFavorito(verseId: number) {
    try {
      setCarregandoFavorito((prev) => ({ ...prev, [verseId]: true }));

      const res = await fetch("/api/favoritos/versiculos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verseId }),
      });

      if (!res.ok) return;

      const data = (await res.json()) as { isFavorite: boolean };

      setFavoritos((prev) => ({
        ...prev,
        [verseId]: data.isFavorite,
      }));
    } finally {
      setCarregandoFavorito((prev) => ({ ...prev, [verseId]: false }));
    }
  }

  function abrirModalAnotacao(verseId: number) {
    setVersiculoAtualId(verseId);
    setTextoAnotacao(anotacoes[verseId] ?? "");
    setModalAberta(true);
  }

  function fecharModalAnotacao() {
    setModalAberta(false);
    setVersiculoAtualId(null);
    setTextoAnotacao("");
  }

  async function salvarAnotacao() {
    if (!versiculoAtualId) return;

    try {
      setSalvandoAnotacao(true);

      const res = await fetch("/api/anotacoes/versiculos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verseId: versiculoAtualId,
          content: textoAnotacao,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Erro anotação:", text);
        return;
      }

      const data = (await res.json()) as { noteContent: string | null };

      setAnotacoes((prev) => {
        const next = { ...prev };

        if (data.noteContent) {
          next[versiculoAtualId] = data.noteContent;
        } else {
          delete next[versiculoAtualId];
        }

        return next;
      });

      fecharModalAnotacao();
    } catch (error) {
      console.error("Erro ao salvar anotação:", error);
    } finally {
      setSalvandoAnotacao(false);
    }
  }

  return (
    <div className={styles.container}>
      <Link
        href={`/livros/${slug}?v=${version}#top`}
        className={styles.backLink}
        aria-label="Voltar para capítulos"
      >
        <span className={styles.backIcon}>←</span>
        <span className={styles.backText}>Voltar</span>
      </Link>

      <div className={styles.headerRow}>
        <h1 className={styles.title}>
          {livro} {capitulo}
        </h1>

        <span className={styles.badge}>
          {versiculos.length} versículos • {version.toUpperCase()}
        </span>
      </div>

      <input
        className={styles.search}
        placeholder="Buscar versículo (número ou texto)..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className={styles.verseNav}>
        {filtrados.map((v) => (
          <button
            key={v.number}
            className={`${styles.verseBtn} ${
              ativo === v.number ? styles.activeBtn : ""
            }`}
            onClick={() => {
              setAtivo(v.number);
              document
                .getElementById(`v-${v.number}`)
                ?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          >
            {v.number}
          </button>
        ))}
      </div>

      <ol className={styles.verses}>
        {filtrados.map((v) => {
          const isFavorite = Boolean(favoritos[v.id]);
          const isLoadingFavorite = Boolean(carregandoFavorito[v.id]);
          const temAnotacao = Boolean(anotacoes[v.id]);

          return (
            <li
              key={v.id}
              id={`v-${v.number}`}
              className={`${styles.verseCard} ${
                ativo === v.number ? styles.active : ""
              } ${temAnotacao ? styles.hasNote : ""}`}
            >
              <div className={styles.verseMain}>
                <div className={styles.verseTop}>
                  <div className={styles.verseMeta}>
                    <span className={styles.verseNumber}>{v.number}</span>

                    <div className={styles.verseActions}>
                      <button
                        type="button"
                        onClick={() => toggleFavorito(v.id)}
                        disabled={isLoadingFavorite}
                        className={`${styles.favoriteBtn} ${
                          isFavorite ? styles.favoriteBtnActive : ""
                        }`}
                      >
                        {isLoadingFavorite ? "..." : isFavorite ? "★" : "☆"}
                      </button>

                      <button
                        type="button"
                        onClick={() => abrirModalAnotacao(v.id)}
                        className={`${styles.noteBtn} ${
                          temAnotacao ? styles.noteBtnActive : ""
                        }`}
                        aria-label={temAnotacao ? "Editar anotação" : "Anotar"}
                        title={temAnotacao ? "Editar anotação" : "Anotar"}
                      >
                        <span className={styles.noteBtnIcon}>📝</span>
                      </button>
                    </div>
                  </div>
                </div>

                <span className={styles.verseText}>{v.text}</span>
              </div>

              {temAnotacao && (
                <div className={styles.notePreview}>
                  <div className={styles.notePreviewLabel}>Anotação</div>
                  <div className={styles.notePreviewText}>
                    {anotacoes[v.id]}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {filtrados.length === 0 && (
        <p className={styles.empty}>Nenhum versículo encontrado.</p>
      )}

      {modalAberta && versiculoAtual && (
        <div className={styles.modalOverlay} onClick={fecharModalAnotacao}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                Anotação • {livro} {capitulo}:{versiculoAtual.number}
              </h2>
            </div>

            <p className={styles.modalVerse}>{versiculoAtual.text}</p>

            <textarea
              className={styles.modalTextarea}
              placeholder="Ex: culto de domingo, pregação do pastor, algo que Deus falou com você..."
              value={textoAnotacao}
              onChange={(e) => setTextoAnotacao(e.target.value)}
              rows={6}
            />

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.modalSecondaryBtn}
                onClick={fecharModalAnotacao}
                disabled={salvandoAnotacao}
              >
                Cancelar
              </button>

              <button
                type="button"
                className={styles.modalSecondaryBtn}
                onClick={() => setTextoAnotacao("")}
                disabled={salvandoAnotacao}
              >
                Limpar
              </button>

              <button
                type="button"
                className={styles.modalPrimaryBtn}
                onClick={salvarAnotacao}
                disabled={salvandoAnotacao}
              >
                {salvandoAnotacao ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
