import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { BIBLE_AUTH_COOKIE, getBibleAppKey, getPanelApiUrl } from "./config";

export type BibleAuth = {
  user: {
    id: string;
    name: string;
    username: string;
    expiresAt: string | null;
  };
  project: {
    id: string;
    name: string;
    slug: string;
    appKey: string;
  };
};

export const getBibleAuth = cache(async (): Promise<BibleAuth | null> => {
  const token = (await cookies()).get(BIBLE_AUTH_COOKIE)?.value;
  if (!token) return null;

  try {
    const response = await fetch(`${getPanelApiUrl()}/api/apk/auth/validate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: "{}",
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data = await response.json();

    if (!data?.allowed || data.project?.appKey !== getBibleAppKey()) return null;

    return {
      user: data.user,
      project: data.project,
    };
  } catch {
    return null;
  }
});

export async function requireBibleAuth() {
  const auth = await getBibleAuth();
  if (!auth) redirect("/login");
  return auth;
}

export async function getBibleAccessToken() {
  return (await cookies()).get(BIBLE_AUTH_COOKIE)?.value ?? null;
}
