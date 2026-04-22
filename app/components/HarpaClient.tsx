//app/components/HarpaClient.tsx

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type HarpaItem = {
  number: number;
  title: string;
  versesCount: number;
};

export default function HarpaClient({
  hinos,
  styles,
}: {
  hinos: HarpaItem[];
  styles: Record<string, string>;
}) {
  const [q, setQ] = useState("");

  const filtrados = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return hinos;

    // tenta buscar por número (ex: 15)
    const num = Number(s.replace(/[^\d]/g, ""));
    if (Number.isFinite(num) && num > 0) {
      return hinos.filter((h) => h.number === num);
    }

    // busca por texto no título
    return hinos.filter((h) => h.title.toLowerCase().includes(s));
  }, [q, hinos]);

  return (
    <>
      <input
        className={styles.search}
        placeholder="Buscar hino (ex: 15 ou 'graça')"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className={styles.grid}>
        {filtrados.map((h) => (
          <Link
            key={h.number}
            href={`/harpa/${h.number}`}
            className={styles.card}
          >
            <div className={styles.cardTitle}>
              {h.number}. {h.title}
            </div>
            <div className={styles.count}>{h.versesCount} estrofes</div>
          </Link>
        ))}
      </div>

      {filtrados.length === 0 && (
        <p className={styles.empty}>Nenhum hino encontrado.</p>
      )}
    </>
  );
}
