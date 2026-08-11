// lib/auth/server.ts

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import {
  BIBLE_AUTH_COOKIE,
  getBibleAppKey,
  getPanelApiUrl,
} from "./config";

export type BiblePermissions = Record<
  string,
  boolean
>;

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

  permissions: BiblePermissions;
};

/*
 * =========================================================
 * BUSCA A AUTENTICAÇÃO ATUAL NO PAINEL LHP
 * =========================================================
 */

export const getBibleAuth = cache(
  async (): Promise<BibleAuth | null> => {
    const token = (await cookies()).get(
      BIBLE_AUTH_COOKIE,
    )?.value;

    if (!token) {
      return null;
    }

    try {
      const response = await fetch(
        `${getPanelApiUrl()}/api/apk/auth/validate`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },

          body: "{}",

          cache: "no-store",
        },
      );

      if (!response.ok) {
        return null;
      }

      const data =
        await response.json();

      if (
        !data?.allowed ||
        data.project?.appKey !==
        getBibleAppKey()
      ) {
        return null;
      }

      /*
       * Normalizamos as permissões.
       *
       * Qualquer valor diferente de true
       * será considerado false.
       */
      const permissions: BiblePermissions =
        Object.fromEntries(
          Object.entries(
            data.permissions ?? {},
          ).map(([key, value]) => [
            key,
            value === true,
          ]),
        );

      return {
        user: {
          id: data.user.id,

          name: data.user.name,

          username:
            data.user.username,

          expiresAt:
            data.user.expiresAt ??
            null,
        },

        project: {
          id: data.project.id,

          name: data.project.name,

          slug: data.project.slug,

          appKey:
            data.project.appKey,
        },

        permissions,
      };
    } catch (error) {
      console.error(
        "Erro ao validar acesso da Bíblia:",
        error,
      );

      return null;
    }
  },
);

/*
 * =========================================================
 * EXIGE LOGIN
 * =========================================================
 */

export async function requireBibleAuth() {
  const auth =
    await getBibleAuth();

  if (!auth) {
    redirect("/login");
  }

  return auth;
}

/*
 * =========================================================
 * VERIFICA UMA PERMISSÃO
 * =========================================================
 */

export function hasBiblePermission(
  auth: BibleAuth,
  permissionKey: string,
) {
  return (
    auth.permissions[
    permissionKey
    ] === true
  );
}

/*
 * =========================================================
 * EXIGE LOGIN + PERMISSÃO
 *
 * Usaremos principalmente em páginas Server Component.
 * =========================================================
 */

export async function requireBiblePermission(
  permissionKey: string,
  redirectTo = "/",
) {
  const auth =
    await requireBibleAuth();

  if (
    !hasBiblePermission(
      auth,
      permissionKey,
    )
  ) {
    redirect(redirectTo);
  }

  return auth;
}

/*
 * =========================================================
 * RETORNA SOMENTE AS PERMISSÕES
 * =========================================================
 */

export async function getBiblePermissions() {
  const auth =
    await getBibleAuth();

  return (
    auth?.permissions ?? {}
  );
}

/*
 * =========================================================
 * TOKEN DO PAINEL
 * =========================================================
 */

export async function getBibleAccessToken() {
  return (
    (await cookies()).get(
      BIBLE_AUTH_COOKIE,
    )?.value ?? null
  );
}