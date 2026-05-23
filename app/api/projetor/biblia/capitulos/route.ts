import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { jsonError, unauthorized, validarTokenProjetor } from "../../_helpers";

export async function GET(req: NextRequest) {
  if (!validarTokenProjetor(req)) {
    return unauthorized();
  }

  const slug = req.nextUrl.searchParams.get("slug")?.trim();
  const versao =
    req.nextUrl.searchParams.get("v")?.trim().toLowerCase() || "acf";

  if (!slug) {
    return jsonError("Informe o slug do livro.", 400);
  }

  try {
    const traducao = await prisma.translation.findUnique({
      where: {
        code: versao,
      },
      select: {
        id: true,
        code: true,
        name: true,
      },
    });

    if (!traducao) {
      return jsonError("Tradução não encontrada.", 404);
    }

    const livro = await prisma.book.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        chapters: {
          orderBy: {
            number: "asc",
          },
          select: {
            id: true,
            number: true,
            _count: {
              select: {
                verses: {
                  where: {
                    translationId: traducao.id,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!livro) {
      return jsonError("Livro não encontrado.", 404);
    }

    return NextResponse.json({
      ok: true,
      traducao: {
        id: traducao.id,
        codigo: traducao.code,
        nome: traducao.name,
      },
      livro: {
        id: livro.id,
        nome: livro.name,
        slug: livro.slug,
      },
      items: livro.chapters.map((capitulo) => ({
        id: capitulo.id,
        numero: capitulo.number,
        versiculos: capitulo._count.verses,
      })),
    });
  } catch (error) {
    console.error("Erro ao carregar capítulos para o projetor:", error);

    return jsonError("Não foi possível carregar os capítulos.", 500);
  }
}
