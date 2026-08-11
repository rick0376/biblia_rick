// app/api/auth/login/route.ts

import { NextResponse } from "next/server";

import {
  BIBLE_AUTH_COOKIE,
  getBibleAppKey,
  getPanelApiUrl,
} from "../../../../lib/auth/config";

import { prisma } from "../../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username = String(
      body?.username ?? "",
    ).trim();

    const password = String(
      body?.password ?? "",
    );

    const deviceId = String(
      body?.deviceId ?? "",
    ).trim();

    const deviceName = String(
      body?.deviceName ??
      "Navegador Web",
    ).trim();

    const remember =
      body?.remember !== false;

    if (
      !username ||
      !password ||
      deviceId.length < 8
    ) {
      return NextResponse.json(
        {
          error:
            "Preencha usuário e senha corretamente.",
        },
        {
          status: 400,
        },
      );
    }

    /*
     * LOGIN CENTRALIZADO NO PAINEL LHP
     */
    const panelResponse =
      await fetch(
        `${getPanelApiUrl()}/api/apk/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            appKey:
              getBibleAppKey(),

            username,
            password,
            deviceId,
            deviceName,
          }),

          cache: "no-store",
        },
      );

    const panelData =
      await panelResponse
        .json()
        .catch(() => null);

    if (
      !panelResponse.ok ||
      !panelData?.allowed
    ) {
      return NextResponse.json(
        {
          error:
            panelData?.error ||
            "Usuário ou senha inválidos.",

          support:
            panelData?.support ??
            null,
        },
        {
          status:
            panelResponse.status ||
            401,
        },
      );
    }

    /*
     * Mantém o usuário local da Bíblia
     * sincronizado com o usuário do painel.
     */
    await prisma.bibleUser.upsert({
      where: {
        id: panelData.user.id,
      },

      update: {
        panelUserId:
          panelData.user.id,

        name:
          panelData.user.name,

        username:
          panelData.user.username,
      },

      create: {
        id:
          panelData.user.id,

        panelUserId:
          panelData.user.id,

        name:
          panelData.user.name,

        username:
          panelData.user.username,
      },
    });

    /*
     * Agora também devolvemos para a Bíblia
     * as permissões dinâmicas criadas no painel.
     *
     * Exemplo:
     *
     * {
     *   use_ai: true,
     *   create_notes: true,
     *   add_favorites: false
     * }
     */
    const response =
      NextResponse.json({
        allowed: true,

        user:
          panelData.user,

        project:
          panelData.project ??
          null,

        permissions:
          panelData.permissions ??
          {},

        expiresInSeconds:
          panelData.expiresInSeconds,

        support:
          panelData.support ??
          null,
      });

    /*
     * Guardamos somente o token de acesso
     * em cookie HTTP Only.
     *
     * As permissões NÃO serão usadas como
     * segurança somente no navegador.
     * Depois vamos validá-las pelo servidor.
     */
    response.cookies.set({
      name:
        BIBLE_AUTH_COOKIE,

      value:
        panelData.accessToken,

      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite: "lax",

      path: "/",

      ...(remember
        ? {
          maxAge:
            panelData.expiresInSeconds ||
            12 * 60 * 60,
        }
        : {}),
    });

    return response;
  } catch (error) {
    console.error(
      "Erro no login da Bíblia:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível validar o acesso.",
      },
      {
        status: 500,
      },
    );
  }
}