// app/api/favoritos/versiculos/route.ts

import { NextResponse } from "next/server";

import {
  getBibleAuth,
  hasBiblePermission,
} from "../../../../lib/auth/server";

import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
  try {
    // 1. Verifica login
    const auth = await getBibleAuth();

    if (!auth) {
      return NextResponse.json(
        {
          error: "Sessão expirada.",
        },
        {
          status: 401,
        },
      );
    }

    // 2. Verifica permissão
    if (!hasBiblePermission(auth, "add_favorites")) {
      return NextResponse.json(
        {
          error:
            "Seu usuário não possui permissão para adicionar favoritos.",
        },
        {
          status: 403,
        },
      );
    }

    // 3. Lê o versículo
    const body = (await req.json()) as {
      verseId?: number;
    };

    const verseId = Number(body.verseId);

    if (
      !Number.isFinite(verseId) ||
      verseId <= 0
    ) {
      return NextResponse.json(
        {
          error: "verseId inválido.",
        },
        {
          status: 400,
        },
      );
    }

    // 4. Verifica se já está favorito
    const existing =
      await prisma.favoriteVerse.findUnique({
        where: {
          userId_verseId: {
            userId: auth.user.id,
            verseId,
          },
        },

        select: {
          id: true,
        },
      });

    // 5. Se já existe, remove
    if (existing) {
      await prisma.favoriteVerse.delete({
        where: {
          id: existing.id,
        },
      });

      return NextResponse.json({
        isFavorite: false,
      });
    }

    // 6. Caso contrário, adiciona
    await prisma.favoriteVerse.create({
      data: {
        userId: auth.user.id,
        verseId,
      },
    });

    return NextResponse.json({
      isFavorite: true,
    });
  } catch (error) {
    console.error(
      "Erro ao alternar favorito do versículo:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Erro ao alternar favorito do versículo.",
      },
      {
        status: 500,
      },
    );
  }
}