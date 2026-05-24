//app/api/projetor/biblia/buscar/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { jsonError, unauthorized, validarTokenProjetor } from "../../_helpers";

function normalizarTexto(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function textoCombinaComBusca(texto: string, termo: string) {
  const textoNormalizado = normalizarTexto(texto);
  const termoNormalizado = normalizarTexto(termo);

  if (!termoNormalizado) {
    return false;
  }

  return textoNormalizado.includes(termoNormalizado);
}

export async function GET(req: NextRequest) {
  if (!validarTokenProjetor(req)) {
    return unauthorized();
  }

  const termo = req.nextUrl.searchParams.get("q")?.trim();
  const versao =
    req.nextUrl.searchParams.get("v")?.trim().toLowerCase() || "acf";

  if (!termo || termo.length < 2) {
    return jsonError("Informe pelo menos 2 caracteres para buscar.", 400);
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

    const todosVersiculos = await prisma.verse.findMany({
      where: {
        translationId: traducao.id,
      },
      select: {
        id: true,
        number: true,
        text: true,
        chapter: {
          select: {
            id: true,
            number: true,
            book: {
              select: {
                id: true,
                name: true,
                slug: true,
                order: true,
              },
            },
          },
        },
      },
    });

    const encontrados = todosVersiculos
      .filter((versiculo) => textoCombinaComBusca(versiculo.text, termo))
      .sort((a, b) => {
        if (a.chapter.book.order !== b.chapter.book.order) {
          return a.chapter.book.order - b.chapter.book.order;
        }

        if (a.chapter.number !== b.chapter.number) {
          return a.chapter.number - b.chapter.number;
        }

        return a.number - b.number;
      })
      .slice(0, 80);

    return NextResponse.json({
      ok: true,
      termo,
      traducao: {
        id: traducao.id,
        codigo: traducao.code,
        nome: traducao.name,
      },
      total: encontrados.length,
      items: encontrados.map((versiculo) => ({
        id: versiculo.id,
        numero: versiculo.number,
        texto: versiculo.text,
        referencia: `${versiculo.chapter.book.name} ${versiculo.chapter.number}:${versiculo.number}`,
        livro: {
          id: versiculo.chapter.book.id,
          nome: versiculo.chapter.book.name,
          slug: versiculo.chapter.book.slug,
          ordem: versiculo.chapter.book.order,
        },
        capitulo: {
          id: versiculo.chapter.id,
          numero: versiculo.chapter.number,
        },
      })),
    });
  } catch (error) {
    console.error("Erro ao buscar versículos para o projetor:", error);

    return jsonError("Não foi possível buscar na Bíblia.", 500);
  }
}
