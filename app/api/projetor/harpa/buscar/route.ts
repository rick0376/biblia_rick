//app/api/projetor/harpa/buscar/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { jsonError, unauthorized, validarTokenProjetor } from "../../_helpers";

function normalizarTexto(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function escaparRegex(valor: string) {
  return valor.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function textoCombinaComBusca(texto: string, termo: string) {
  const textoNormalizado = normalizarTexto(texto);
  const termoNormalizado = normalizarTexto(termo);

  if (!termoNormalizado) {
    return false;
  }

  if (termoNormalizado.includes(" ")) {
    return textoNormalizado.includes(termoNormalizado);
  }

  const regex = new RegExp(
    `(^|[^\\p{L}\\p{N}])${escaparRegex(termoNormalizado)}($|[^\\p{L}\\p{N}])`,
    "u",
  );

  return regex.test(textoNormalizado);
}

function montarTituloParte(tipo: string, numero: number) {
  if (tipo === "CHORUS") {
    return "Coro";
  }

  return `Estrofe ${numero}`;
}

export async function GET(req: NextRequest) {
  if (!validarTokenProjetor(req)) {
    return unauthorized();
  }

  const termo = req.nextUrl.searchParams.get("q")?.trim();

  if (!termo || termo.length < 1) {
    return jsonError("Informe algo para buscar na Harpa.", 400);
  }

  try {
    const numeroBuscado = Number(termo);

    const hinos = await prisma.hymn.findMany({
      orderBy: {
        number: "asc",
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

    const resultados: Array<{
      tipoResultado: string;
      id: number;
      numero: number;
      titulo: string;
      display: string;
      temCoro: boolean;
      parte: null | {
        id: number;
        numero: number;
        texto: string;
        tipo: string;
        posicao: number;
        tituloParte: string;
      };
    }> = [];

    for (const hino of hinos) {
      if (
        Number.isInteger(numeroBuscado) &&
        numeroBuscado > 0 &&
        hino.number === numeroBuscado
      ) {
        resultados.push({
          tipoResultado: "NUMERO",
          id: hino.id,
          numero: hino.number,
          titulo: hino.title,
          display: `${hino.number} - ${hino.title}`,
          temCoro: !!hino.chorus,
          parte: null,
        });

        continue;
      }

      if (textoCombinaComBusca(hino.title, termo)) {
        resultados.push({
          tipoResultado: "TITULO",
          id: hino.id,
          numero: hino.number,
          titulo: hino.title,
          display: `${hino.number} - ${hino.title}`,
          temCoro: !!hino.chorus,
          parte: null,
        });
      }

      for (const parte of hino.verses) {
        if (!textoCombinaComBusca(parte.text, termo)) {
          continue;
        }

        resultados.push({
          tipoResultado: "TRECHO",
          id: hino.id,
          numero: hino.number,
          titulo: hino.title,
          display: `${hino.number} - ${hino.title}`,
          temCoro: !!hino.chorus,
          parte: {
            id: parte.id,
            numero: parte.number,
            texto: parte.text,
            tipo: parte.type,
            posicao: parte.position,
            tituloParte: montarTituloParte(parte.type, parte.number),
          },
        });
      }
    }

    return NextResponse.json({
      ok: true,
      termo,
      total: resultados.slice(0, 80).length,
      items: resultados.slice(0, 80),
    });
  } catch (error) {
    console.error("Erro ao buscar hinos da Harpa para o projetor:", error);

    return jsonError("Não foi possível buscar na Harpa.", 500);
  }
}
