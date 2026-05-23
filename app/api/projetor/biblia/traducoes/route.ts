//app/api/projetor/biblia/traducoes/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { jsonError, unauthorized, validarTokenProjetor } from "../../_helpers";

export async function GET(req: NextRequest) {
  if (!validarTokenProjetor(req)) {
    return unauthorized();
  }

  try {
    const traducoes = await prisma.translation.findMany({
      orderBy: {
        code: "asc",
      },
      select: {
        id: true,
        code: true,
        name: true,
      },
    });

    return NextResponse.json({
      ok: true,
      total: traducoes.length,
      items: traducoes.map((traducao) => ({
        id: traducao.id,
        codigo: traducao.code,
        nome: traducao.name,
        display: `${traducao.code.toUpperCase()} - ${traducao.name}`,
      })),
    });
  } catch (error) {
    console.error("Erro ao carregar traduções para o projetor:", error);

    return jsonError("Não foi possível carregar as traduções da Bíblia.", 500);
  }
}
