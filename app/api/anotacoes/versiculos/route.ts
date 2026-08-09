import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getBibleAuth } from "../../../../lib/auth/server";

export async function POST(req: Request) {
  try {
    const auth = await getBibleAuth();
    if (!auth) return NextResponse.json({ error: "Sessão expirada." }, { status: 401 });

    const body = (await req.json()) as { verseId?: number; content?: string };
    const verseId = Number(body.verseId);
    const content = String(body.content ?? "").trim();

    if (!Number.isFinite(verseId) || verseId <= 0) {
      return NextResponse.json({ error: "verseId inválido" }, { status: 400 });
    }

    if (content.length === 0) {
      await prisma.verseNote.deleteMany({ where: { userId: auth.user.id, verseId } });
      return NextResponse.json({ noteContent: null });
    }

    const note = await prisma.verseNote.upsert({
      where: { userId_verseId: { userId: auth.user.id, verseId } },
      update: { content },
      create: { userId: auth.user.id, verseId, content },
      select: { content: true },
    });

    return NextResponse.json({ noteContent: note.content });
  } catch (error) {
    console.error("Erro real da anotação:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erro ao salvar anotação do versículo" }, { status: 500 });
  }
}
