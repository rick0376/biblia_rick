import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getBibleAuth } from "../../../../lib/auth/server";

export async function POST(req: Request) {
  try {
    const auth = await getBibleAuth();
    if (!auth) return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });

    const body = (await req.json()) as { verseId?: number };
    const verseId = Number(body.verseId);
    if (!Number.isFinite(verseId) || verseId <= 0) {
      return NextResponse.json({ error: "verseId inválido" }, { status: 400 });
    }

    const existing = await prisma.favoriteVerse.findUnique({
      where: { userId_verseId: { userId: auth.user.id, verseId } },
      select: { id: true },
    });

    if (existing) {
      await prisma.favoriteVerse.delete({ where: { id: existing.id } });
      return NextResponse.json({ isFavorite: false });
    }

    await prisma.favoriteVerse.create({ data: { userId: auth.user.id, verseId } });
    return NextResponse.json({ isFavorite: true });
  } catch {
    return NextResponse.json({ error: "Erro ao alternar favorito do versículo" }, { status: 500 });
  }
}
