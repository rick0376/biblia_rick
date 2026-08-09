"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./styles.module.scss";

function getDeviceId() {
  const key = "biblia_device_id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const value = `web-${crypto.randomUUID()}`;
  window.localStorage.setItem(key, value);
  return value;
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [support, setSupport] = useState<{ whatsappUrl?: string | null } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSupport(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          deviceId: getDeviceId(),
          deviceName: "Navegador Web",
          remember,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "Não foi possível entrar.");
        setSupport(data?.support ?? null);
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("Falha de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.presentation}>
          <div className={styles.glow} />
          <div className={styles.cross} aria-hidden="true">✝</div>

          <div className={styles.brand}>
            <div className={styles.dove} aria-hidden="true">◈</div>
            <div>
              <div className={styles.brandTitle}>BÍBLIA</div>
              <div className={styles.brandTitleLight}>SAGRADA</div>
            </div>
          </div>

          <div className={styles.dividerTitle}>A PALAVRA QUE TRANSFORMA</div>

          <blockquote>
            “Lâmpada para os meus pés é a tua palavra,
            <br />
            e luz para o meu caminho.”
            <cite>Salmos 119:105</cite>
          </blockquote>

          <div className={styles.bibleVisual} aria-hidden="true">
            <div className={styles.biblePage} />
            <div className={styles.bibleSpine} />
            <div className={styles.bibleGlow} />
          </div>

          <div className={styles.features}>
            <span>▱ <b>Leia</b><small>a Bíblia</small></span>
            <span>♡ <b>Favorite</b><small>versículos</small></span>
            <span>▤ <b>Anote</b><small>suas reflexões</small></span>
            <span>⌕ <b>Busque</b><small>conhecimento</small></span>
            <span>◯ <b>Pergunte</b><small>à Bíblia (IA)</small></span>
          </div>
        </div>

        <div className={styles.loginPanel}>
          <div className={styles.themePill} aria-hidden="true">☀︎ &nbsp; ◐</div>

          <div className={styles.loginIcon}>✝</div>
          <h1>Bem-vindo!</h1>
          <p className={styles.loginSubtitle}>Faça login para continuar sua jornada</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <label>
              <span>E-mail / Usuário</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Digite seu usuário"
                autoComplete="username"
                required
              />
            </label>

            <label>
              <span>Senha</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Digite sua senha"
                autoComplete="current-password"
                required
              />
            </label>

            <div className={styles.options}>
              <label className={styles.remember}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                />
                <span>Lembrar-me</span>
              </label>
              <span className={styles.help}>Acesso controlado pelo LHP</span>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {support?.whatsappUrl && (
              <a className={styles.support} href={support.whatsappUrl} target="_blank" rel="noreferrer">
                Precisa de ajuda com o acesso?
              </a>
            )}

            <button className={styles.submit} type="submit" disabled={loading}>
              {loading ? "Validando acesso..." : "Entrar"}
            </button>
          </form>

          <div className={styles.securityNote}>
            <span>🔒</span>
            Seu acesso, validade e dispositivos são controlados pelo painel LHP.
          </div>
        </div>
      </section>

      <footer>Feito com amor para edificação do corpo de Cristo</footer>
    </main>
  );
}
