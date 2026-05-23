//app/api/projetor/harpa/hino/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { jsonError, unauthorized, validarTokenProjetor } from "../../_helpers";

export async function GET(req: NextRequest) {
  if (!validarTokenProjetor(req)) {
    return unauthorized();
  }

  const numeroTexto = req.nextUrl.searchParams.get("numero")?.trim();

  if (!numeroTexto) {
    return jsonError("Informe o número do hino.", 400);
  }

  const numero = Number(numeroTexto);

  if (!Number.isInteger(numero) || numero <= 0) {
    return jsonError("Número do hino inválido.", 400);
  }

  try {
    const hino = await prisma.hymn.findUnique({
      where: {
        number: numero,
      },
      select: {
        id: true,
        number: true,
        title: true,
        chorus: true,
        verses: {
          orderBy: [
            {
              position: "asc",
            },
            {
              number: "asc",
            },
          ],
          select: {
            id: true,
            number: true,
            text: true,
            type: true,
            position: true,
          },
        },
      },
    });

    if (!hino) {
      return jsonError("Hino não encontrado.", 404);
    }

    return NextResponse.json({
      ok: true,
      item: {
        id: hino.id,
        numero: hino.number,
        titulo: hino.title,
        display: `${hino.number} - ${hino.title}`,
        coro: hino.chorus,
        partes: hino.verses.map((parte) => ({
          id: parte.id,
          numero: parte.number,
          texto: parte.text,
          tipo: parte.type,
          posicao: parte.position,
          tituloParte:
            parte.type === "CHORUS" ? "Coro" : `Estrofe ${parte.number}`,
        })),
      },
    });
  } catch (error) {
    console.error("Erro ao carregar hino da Harpa para o projetor:", error);

    return jsonError("Não foi possível carregar o hino da Harpa.", 500);
  }
}
