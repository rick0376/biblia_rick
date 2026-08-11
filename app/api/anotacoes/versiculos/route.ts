// app/api/anotacoes/versiculos/route.ts

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

    // 2. Verifica permissão de anotações
    if (!hasBiblePermission(auth, "create_notes")) {
      return NextResponse.json(
        {
          error:
            "Seu usuário não possui permissão para criar ou alterar anotações.",
        },
        {
          status: 403,
        },
      );
    }

    // 3. Lê os dados enviados
    const body = (await req.json()) as {
      verseId?: number;
      content?: string;
    };

    const verseId = Number(body.verseId);

    const content = String(
      body.content ?? "",
    ).trim();

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

    // 4. Conteúdo vazio remove a anotação
    if (content.length === 0) {
      await prisma.verseNote.deleteMany({
        where: {
          userId: auth.user.id,
          verseId,
        },
      });

      return NextResponse.json({
        noteContent: null,
      });
    }

    // 5. Cria ou atualiza a anotação
    const note = await prisma.verseNote.upsert({
      where: {
        userId_verseId: {
          userId: auth.user.id,
          verseId,
        },
      },

      update: {
        content,
      },

      create: {
        userId: auth.user.id,
        verseId,
        content,
      },

      select: {
        content: true,
      },
    });

    return NextResponse.json({
      noteContent: note.content,
    });
  } catch (error) {
    console.error(
      "Erro real da anotação:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao salvar anotação do versículo.",
      },
      {
        status: 500,
      },
    );
  }
}