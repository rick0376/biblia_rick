//app/api/projetor/harpa/hinos/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { jsonError, unauthorized, validarTokenProjetor } from "../../_helpers";

export async function GET(req: NextRequest) {
  if (!validarTokenProjetor(req)) {
    return unauthorized();
  }

  try {
    const hinos = await prisma.hymn.findMany({
      orderBy: {
        number: "asc",
      },
      select: {
        id: true,
        number: true,
        title: true,
        chorus: true,
        _count: {
          select: {
            verses: true,
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      total: hinos.length,
      items: hinos.map((hino) => ({
        id: hino.id,
        numero: hino.number,
        titulo: hino.title,
        temCoro: !!hino.chorus,
        partes: hino._count.verses,
        display: `${hino.number} - ${hino.title}`,
      })),
    });
  } catch (error) {
    console.error("Erro ao carregar hinos da Harpa para o projetor:", error);

    return jsonError("Não foi possível carregar os hinos da Harpa.", 500);
  }
}
