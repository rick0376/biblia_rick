"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      style={{
        border: "1px solid rgba(148, 163, 184, .18)",
        borderRadius: 12,
        padding: "10px 15px",
        color: "rgba(241,245,249,.78)",
        background: "rgba(255,255,255,.035)",
        cursor: "pointer",
        fontWeight: 750,
      }}
    >
      Sair
    </button>
  );
}
