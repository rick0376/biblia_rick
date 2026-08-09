import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getBibleAuth } from "../../../../lib/auth/server";

export async function POST(req: Request) {
  try {
    const auth = await getBibleAuth();
    if (!auth) return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });

    const body = (await req.json()) as { hymnId?: number };
    const hymnId = Number(body.hymnId);
    if (!Number.isFinite(hymnId) || hymnId <= 0) {
      return NextResponse.json({ error: "hymnId inválido" }, { status: 400 });
    }

    const existing = await prisma.favoriteHymn.findUnique({
      where: { userId_hymnId: { userId: auth.user.id, hymnId } },
      select: { id: true },
    });

    if (existing) {
      await prisma.favoriteHymn.delete({ where: { id: existing.id } });
      return NextResponse.json({ isFavorite: false });
    }

    await prisma.favoriteHymn.create({ data: { userId: auth.user.id, hymnId } });
    return NextResponse.json({ isFavorite: true });
  } catch {
    return NextResponse.json({ error: "Erro ao alternar favorito do hino" }, { status: 500 });
  }
}
