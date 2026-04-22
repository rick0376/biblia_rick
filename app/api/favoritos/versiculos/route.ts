//app/api/favoritos/versiculos/route.ts

import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { verseId?: number };
    const verseId = Number(body.verseId);

    if (!Number.isFinite(verseId) || verseId <= 0) {
      return NextResponse.json({ error: "verseId inválido" }, { status: 400 });
    }

    const existing = await prisma.favoriteVerse.findUnique({
      where: { verseId },
      select: { id: true },
    });

    if (existing) {
      await prisma.favoriteVerse.delete({
        where: { verseId },
      });

      return NextResponse.json({ isFavorite: false });
    }

    await prisma.favoriteVerse.create({
      data: { verseId },
    });

    return NextResponse.json({ isFavorite: true });
  } catch {
    return NextResponse.json(
      { error: "Erro ao alternar favorito do versículo" },
      { status: 500 },
    );
  }
}
