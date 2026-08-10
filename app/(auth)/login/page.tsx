// app/(auth)/login/page.tsx

"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [support, setSupport] = useState<{ whatsappUrl?: string | null } | null>(null);

  useEffect(() => {
    async function carregarSuporte() {
      try {
        const response = await fetch("/api/auth/support", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) return;

        const data = await response.json();

        setSupport(data?.support ?? null);
      } catch (error) {
        console.error("Erro ao carregar suporte:", error);
      }
    }

    carregarSuporte();
  }, []);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

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
        setError(
          data?.error ||
          "Não foi possível entrar.",
        );

        setSupport(data?.support ?? null);

        return;
      }

      if (data?.support) {
        setSupport(data.support);
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError(
        "Falha de conexão com o servidor.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.shell}>

        {/* LADO ESQUERDO */}

        <div className={styles.presentation}>
          <Image
            src="/login/login-biblia.png"
            alt="Bíblia Sagrada"
            fill
            priority
            className={styles.presentationImage}
            sizes="(max-width: 1000px) 100vw, 55vw"
          />
        </div>


        {/* LADO DIREITO */}

        <div className={styles.loginPanel}>
          <div
            className={styles.themePill}
            aria-hidden="true"
          >
            ☀︎ &nbsp;&nbsp; ◐
          </div>

          <div className={styles.loginIcon}>
            <Image
              src="/login/login-icon.png"
              alt="Bíblia Sagrada"
              width={110}
              height={110}
              className={styles.loginIconImage}
              priority
            />
          </div>

          <h1>Bem-vindo!</h1>

          <p className={styles.loginSubtitle}>
            Faça login para continuar sua jornada
          </p>

          <form
            onSubmit={handleSubmit}
            className={styles.form}
          >
            <label>
              <span>E-mail / Usuário</span>

              <input
                value={username}
                onChange={(event) =>
                  setUsername(
                    event.target.value,
                  )
                }
                placeholder="Digite seu usuário"
                autoComplete="username"
                required
              />
            </label>

            <label>
              <span>Senha</span>

              <div
                className={
                  styles.passwordField
                }
              >
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value,
                    )
                  }
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className={
                    styles.passwordToggle
                  }
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev,
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Ocultar senha"
                      : "Mostrar senha"
                  }
                  title={
                    showPassword
                      ? "Ocultar senha"
                      : "Mostrar senha"
                  }
                >
                  {showPassword ? (
                    /* olho riscado */
                    <svg
                      viewBox="0 0 24 24"
                      width="21"
                      height="21"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                      <path d="M9.9 4.2A10.7 10.7 0 0112 4c5 0 8.5 4 9.5 6-0.5 1-1.5 2.3-2.9 3.4" />
                      <path d="M6.2 6.2C4.3 7.5 3 9.2 2.5 10c1 2 4.5 6 9.5 6 1.2 0 2.3-.2 3.3-.6" />
                    </svg>
                  ) : (
                    /* olho */
                    <svg
                      viewBox="0 0 24 24"
                      width="21"
                      height="21"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
                      <circle
                        cx="12"
                        cy="12"
                        r="2.5"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            <div className={styles.options}>
              <label
                className={styles.remember}
              >
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) =>
                    setRemember(
                      event.target.checked,
                    )
                  }
                />

                <span>Lembrar-me</span>
              </label>

              <span className={styles.help}>
                Acesso controlado por Rick Pereira
              </span>
            </div>

            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            {support?.whatsappUrl && (
              <a
                className={
                  styles.whatsappSupport
                }
                href={
                  support.whatsappUrl
                }
                target="_blank"
                rel="noreferrer"
              >
                <span
                  className={
                    styles.whatsappIcon
                  }
                >
                  ☎
                </span>

                <div>
                  <strong>
                    Precisa de ajuda?
                  </strong>

                  <small>
                    Fale conosco pelo WhatsApp
                  </small>
                </div>
              </a>
            )}

            <button
              className={styles.submit}
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Validando acesso..."
                : "Entrar"}
            </button>
          </form>

          <div
            className={styles.securityNote}
          >
            <span>🔒</span>

            Seu acesso, validade e dispositivos
            são controlados pelo painel LHP.
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <span className={styles.footerMessage}>
          ♡ Feito com amor para edificação do corpo de Cristo
        </span>

        <span className={styles.footerDeveloper}>
          Desenvolvido por <strong>Rick Pereira</strong>
          <span className={styles.footerDivider}>•</span>
          <strong className={styles.lhp}>LHPSYSTEMS</strong>
        </span>
      </footer>
    </main>
  );
}