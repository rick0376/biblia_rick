//app/api/projetor/biblia/livros/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { jsonError, unauthorized, validarTokenProjetor } from "../../_helpers";

export async function GET(req: NextRequest) {
  if (!validarTokenProjetor(req)) {
    return unauthorized();
  }

  try {
    const livros = await prisma.book.findMany({
      orderBy: {
        order: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        testament: true,
        order: true,
        _count: {
          select: {
            chapters: true,
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      items: livros.map((livro) => ({
        id: livro.id,
        nome: livro.name,
        slug: livro.slug,
        testamento: livro.testament,
        ordem: livro.order,
        capitulos: livro._count.chapters,
      })),
    });
  } catch (error) {
    console.error("Erro ao carregar livros para o projetor:", error);

    return jsonError("Não foi possível carregar os livros da Bíblia.", 500);
  }
}
