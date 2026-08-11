// app/api/favoritos/hinos/route.ts

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

    // 3. Lê o hino
    const body = (await req.json()) as {
      hymnId?: number;
    };

    const hymnId = Number(body.hymnId);

    if (
      !Number.isFinite(hymnId) ||
      hymnId <= 0
    ) {
      return NextResponse.json(
        {
          error: "hymnId inválido.",
        },
        {
          status: 400,
        },
      );
    }

    // 4. Verifica se já está favorito
    const existing =
      await prisma.favoriteHymn.findUnique({
        where: {
          userId_hymnId: {
            userId: auth.user.id,
            hymnId,
          },
        },

        select: {
          id: true,
        },
      });

    // 5. Se já existe, remove
    if (existing) {
      await prisma.favoriteHymn.delete({
        where: {
          id: existing.id,
        },
      });

      return NextResponse.json({
        isFavorite: false,
      });
    }

    // 6. Caso contrário, adiciona
    await prisma.favoriteHymn.create({
      data: {
        userId: auth.user.id,
        hymnId,
      },
    });

    return NextResponse.json({
      isFavorite: true,
    });
  } catch (error) {
    console.error(
      "Erro ao alternar favorito do hino:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Erro ao alternar favorito do hino.",
      },
      {
        status: 500,
      },
    );
  }
}