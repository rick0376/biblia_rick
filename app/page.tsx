// app/page.tsx

import Link from "next/link";
import { prisma } from "../lib/prisma";
import styles from "./styles.module.scss";
import PergunteBiblia from "./components/PergunteBiblia";
import LogoutButton from "./components/LogoutButton";
import { requireBibleAuth } from "../lib/auth/server";

type Version = "acf" | "ara" | "nvi" | "kja";

function normalizeVersion(v?: string): Version {
  const s = (v ?? "").toLowerCase();
  if (s === "acf" || s === "ara" || s === "nvi" || s === "kja") return s;
  return "acf";
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ v?: string }>;
}) {
  const auth = await requireBibleAuth();
  const { v } = (await searchParams) ?? {};
  const version = normalizeVersion(v);

  const [booksCount, hymnsCount, favoritesCount, notesCount] = await Promise.all([
    prisma.book.count(),
    prisma.hymn.count(),
    prisma.favoriteVerse.count({
      where: { user: { panelUserId: auth.user.id } },
    }),
    prisma.verseNote.count({
      where: { user: { panelUserId: auth.user.id } },
    }),
  ]);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <aside className={styles.sidebar}>
          <Link href={`/?v=${version}`} className={styles.brand}>
            <span className={styles.brandIcon}>📖</span>
            <span>
              <strong>Bíblia Sagrada</strong>
              <small>LHP</small>
            </span>
          </Link>

          <nav className={styles.nav} aria-label="Navegação principal">
            <Link href={`/?v=${version}`} className={`${styles.navItem} ${styles.navActive}`}>
              <span>⌂</span> Início
            </Link>
            <Link href={`/livros?v=${version}`} className={styles.navItem}>
              <span>▤</span> Bíblia
            </Link>
            <Link href="/harpa" className={styles.navItem}>
              <span>♫</span> Harpa Cristã
            </Link>
            <Link href="/favoritos" className={styles.navItem}>
              <span>☆</span> Favoritos
            </Link>
            <Link href="/anotacoes" className={styles.navItem}>
              <span>▧</span> Anotações
            </Link>
          </nav>

          <div className={styles.sidebarBottom}>
            <span className={styles.miniLabel}>Leitura • Estudo • Pesquisa</span>
            <span className={styles.sidebarVerse}>“Lâmpada para os meus pés é tua palavra.”</span>
            <span className={styles.sidebarRef}>Salmos 119:105</span>
          </div>
        </aside>

        <section className={styles.content}>
          <header className={styles.topbar}>
            <div className={styles.mobileBrand}>📖 Bíblia Sagrada <b>LHP</b></div>
            <div className={styles.topActions}>
              <div className={styles.versionMenu}>
                <span>Versão:</span>
                {(["acf", "ara", "nvi", "kja"] as Version[]).map((item) => (
                  <Link
                    key={item}
                    href={`/?v=${item}`}
                    aria-current={version === item ? "page" : undefined}
                  >
                    {item.toUpperCase()}
                  </Link>
                ))}
              </div>
              <span className={styles.userChip}>👤 Olá, {auth.user.name}</span>
              <LogoutButton />
            </div>
          </header>

          <div className={styles.mainContent}>
            <section className={styles.hero}>
              <div className={styles.heroGlow} />
              <div className={styles.heroContent}>
                <span className={styles.heroEyebrow}>Bem-vindo à</span>
                <h1>Bíblia Sagrada - LHP</h1>
                <p>
                  Uma experiência limpa e rápida para navegar por livros, capítulos,
                  versículos e a Harpa Cristã.
                </p>
              </div>

              <div className={styles.stats}>
                <div className={styles.statCard}>
                  <span className={styles.statIcon}>📖</span>
                  <div><strong>{booksCount}</strong><small>Livros Bíblicos</small></div>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statIcon}>♫</span>
                  <div><strong>{hymnsCount}</strong><small>Hinos (Harpa)</small></div>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statIcon}>★</span>
                  <div><strong>{favoritesCount}</strong><small>Favoritos</small></div>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statIcon}>▧</span>
                  <div><strong>{notesCount}</strong><small>Anotações</small></div>
                </div>
              </div>
            </section>

            <PergunteBiblia version={version} canUseAi={auth.permissions.use_ai === true}
            />

            <section className={styles.quickSection}>
              <div className={styles.sectionTitle}>♛ <span>Acesso Rápido</span></div>
              <div className={styles.quickGrid}>
                <Link href={`/livros?v=${version}`} className={`${styles.quickCard} ${styles.quickBible}`}>
                  <span>📖</span>
                  <div><strong>Ler a Bíblia</strong><small>Navegar livros e capítulos</small></div>
                </Link>
                <Link href="/harpa" className={`${styles.quickCard} ${styles.quickHarpa}`}>
                  <span>♫</span>
                  <div><strong>Harpa Cristã</strong><small>{hymnsCount} hinos de louvor</small></div>
                </Link>
                <Link href="/favoritos" className={`${styles.quickCard} ${styles.quickFavorites}`}>
                  <span>★</span>
                  <div><strong>Favoritos</strong><small>Versículos marcados</small></div>
                </Link>
                <Link href="/anotacoes" className={`${styles.quickCard} ${styles.quickNotes}`}>
                  <span>▧</span>
                  <div><strong>Anotações</strong><small>Suas reflexões</small></div>
                </Link>
              </div>
            </section>

            <section className={styles.dailyVerse}>
              <div className={styles.dailyContent}>
                <div className={styles.sectionTitle}>❝ <span>Versículo do Dia</span></div>
                <blockquote>
                  “Entrega o teu caminho ao Senhor; confia nele, e o mais ele fará.”
                </blockquote>
                <strong>Salmos 37:5</strong>
              </div>
              <div className={styles.bibleArt} aria-hidden="true">
                <span className={styles.bookGlow} />
                <span className={styles.openBook}>📖</span>
              </div>
            </section>

            <footer className={styles.footer}>
              <span>
                Desenvolvido com <b>♥</b> por Rick Pereira • (12) 99189-0682
                <a
                  href="https://wa.me/5512991890682"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="WhatsApp"
                  title="WhatsApp"
                  className={styles.whatsIcon}
                >
                  ◉
                </a>
              </span>
              <Link href={`/livros/apocalipse?v=${version}`} className={styles.apocalypseBtn}>
                Ir para Apocalipse <span>→</span>
              </Link>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}
