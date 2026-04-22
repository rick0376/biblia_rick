//app/api/favoritos/hinos/route.ts

import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { hymnId?: number };
    const hymnId = Number(body.hymnId);

    if (!Number.isFinite(hymnId) || hymnId <= 0) {
      return NextResponse.json({ error: "hymnId inválido" }, { status: 400 });
    }

    const existing = await prisma.favoriteHymn.findUnique({
      where: { hymnId },
      select: { id: true },
    });

    if (existing) {
      await prisma.favoriteHymn.delete({
        where: { hymnId },
      });

      return NextResponse.json({ isFavorite: false });
    }

    await prisma.favoriteHymn.create({
      data: { hymnId },
    });

    return NextResponse.json({ isFavorite: true });
  } catch {
    return NextResponse.json(
      { error: "Erro ao alternar favorito do hino" },
      { status: 500 },
    );
  }
}
