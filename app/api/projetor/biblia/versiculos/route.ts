//app/api/projetor/biblia/versiculos/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { jsonError, unauthorized, validarTokenProjetor } from "../../_helpers";

export async function GET(req: NextRequest) {
  if (!validarTokenProjetor(req)) {
    return unauthorized();
  }

  const slug = req.nextUrl.searchParams.get("slug")?.trim();
  const capituloTexto = req.nextUrl.searchParams.get("capitulo")?.trim();
  const versao =
    req.nextUrl.searchParams.get("v")?.trim().toLowerCase() || "acf";

  if (!slug) {
    return jsonError("Informe o slug do livro.", 400);
  }

  if (!capituloTexto) {
    return jsonError("Informe o capítulo.", 400);
  }

  const capituloNumero = Number(capituloTexto);

  if (!Number.isInteger(capituloNumero) || capituloNumero <= 0) {
    return jsonError("Capítulo inválido.", 400);
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
      },
    });

    if (!livro) {
      return jsonError("Livro não encontrado.", 404);
    }

    const capitulo = await prisma.chapter.findFirst({
      where: {
        bookId: livro.id,
        number: capituloNumero,
      },
      select: {
        id: true,
        number: true,
      },
    });

    if (!capitulo) {
      return jsonError("Capítulo não encontrado.", 404);
    }

    const versiculos = await prisma.verse.findMany({
      where: {
        chapterId: capitulo.id,
        translationId: traducao.id,
      },
      orderBy: {
        number: "asc",
      },
      select: {
        id: true,
        number: true,
        text: true,
      },
    });

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
      capitulo: {
        id: capitulo.id,
        numero: capitulo.number,
      },
      referencia: `${livro.name} ${capitulo.number}`,
      items: versiculos.map((versiculo) => ({
        id: versiculo.id,
        numero: versiculo.number,
        texto: versiculo.text,
        referencia: `${livro.name} ${capitulo.number}:${versiculo.number}`,
      })),
    });
  } catch (error) {
    console.error("Erro ao carregar versículos para o projetor:", error);

    return jsonError("Não foi possível carregar os versículos.", 500);
  }
}
